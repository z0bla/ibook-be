import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { SalonsService } from '../salons/salons.service';
import { ServicesService } from '../services/services.service';
import { DayEnum } from '../common/enums/day.enum';
import { User } from '../users/entities/user.entity';
import { AppointmentStatusEnum } from '../common/enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly salonService: SalonsService,
    private readonly servicesService: ServicesService,
  ) {}
  //Funkcija za kreiranje termina
  async createAppointment(
    userId: string,
    salonId: string,
    serviceId: string,
    appointmentDate: Date,
    appointmentTime: string,
  ): Promise<Appointment> {
    //Ucitavanje salona, servisa i korisnika
    const salon = await this.salonService.findById(salonId);
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    const service = await this.servicesService.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Cannot find user!');
    }
    const checkHours = await this.checkSalonOperatingHours(
      salonId,
      appointmentDate,
      appointmentTime,
      service.duration,
    );
    if (!checkHours) {
      throw new ConflictException(
        'Appointment time must be in operating hours',
      );
    }
    //Provjera preklapanja
    const overlapping = await this.checkOverlap(
      service.id,
      appointmentDate,
      appointmentTime,
      service.duration,
    );
    if (overlapping) {
      throw new ConflictException(
        'This appointment overlaps with an existing one!',
      );
    }
    const concurrent = await this.checkConcurrentLimit(
      serviceId,
      appointmentDate,
      appointmentTime,
    );
    if (concurrent) {
      throw new ConflictException(
        'Maximum number of concurrent appointments reached',
      );
    }
    const userLimit = await this.checkUserAppointmentLimit(userId);
    if (userLimit) {
      throw new ConflictException(
        'Maximum number of appointments per user reached',
      );
    }
    //Kreiranje appointment objekta
    const newApp = this.appointmentRepository.create({
      appointmentDate,
      appointmentTime,
      duration: service.duration,
      status: AppointmentStatusEnum.BOOKED,
      user,
      salon,
      service,
    });
    //Snimanje appointment objekta u repo
    await this.appointmentRepository.save(newApp);
    await this.addToPreviousSalons(userId, salonId);
    return newApp;
  }
  async findById(id: string): Promise<Appointment> {
    const app = await this.appointmentRepository.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('appointment not found!');
    }
    return app;
  }
  //Funkcija za provjeru preklapanja
  async checkOverlap(
    serviceId: string,
    appointmentDate: Date,
    appointmentTime: string,
    duration: number,
  ): Promise<boolean> {
    //Racunanje kraja termina
    const endTime = this.calculateEndTime(appointmentTime, duration);
    //Filtriranje termina koji vec postoje za ovaj dan
    const apps = await this.appointmentRepository.find({
      relations: { service: true },
      where: { service: { id: serviceId } },
    });
    if (apps.length < 1) return false;
    const appointments = apps.filter((app) => {
      return (
        appointmentDate.getFullYear() === app.appointmentDate.getFullYear() &&
        appointmentDate.getMonth() === app.appointmentDate.getMonth() &&
        appointmentDate.getDate() === app.appointmentDate.getDate() &&
        app.status === AppointmentStatusEnum.BOOKED
      );
    });
    //Filtriranje termina koji se preklapaju sa zeljenim terminom
    const overlapped = appointments.filter((app) => {
      const end = this.calculateEndTime(app.appointmentTime, app.duration);
      return (
        (appointmentTime > app.appointmentTime && appointmentTime <= end) ||
        (endTime >= app.appointmentTime && endTime < end)
      );
    });
    //Ako ima termina koji se preklapaju, vraca true
    return overlapped.length > 0;
  }
  //Funkcija za provjeru limita istovremenih termina
  async checkConcurrentLimit(
    serviceId: string,
    appointmentDate: Date,
    appointmentTime: string,
  ): Promise<boolean> {
    //Postavljanje limita na 5
    const concurrentLimit = 5;
    //Filtriranje termina sa istim pocetnim vremenom za isti dan
    const apps = await this.appointmentRepository.find({
      relations: { service: true },
      where: { service: { id: serviceId } },
    });
    if (apps.length < 1) return false;
    //Funkcija za uklanjanje sekundi koje se dobijaju iz baze
    function removeZeros(inp: string): string {
      const [hh, mm] = inp.split(':', 2);
      return `${hh}:${mm}`;
    }

    const appointments = apps.filter((app) => {
      return (
        appointmentDate.getFullYear() === app.appointmentDate.getFullYear() &&
        appointmentDate.getMonth() === app.appointmentDate.getMonth() &&
        appointmentDate.getDate() === app.appointmentDate.getDate() &&
        removeZeros(appointmentTime) === removeZeros(app.appointmentTime) &&
        app.status === AppointmentStatusEnum.BOOKED
      );
    });
    //Ako istovremenih termina ima >= od limita, vraca true
    return appointments.length >= concurrentLimit;
  }
  //Funkcija za provjeru limita bukiranih termina od strane istog korisnika
  async checkUserAppointmentLimit(userId: string): Promise<boolean> {
    //Postavljanje limita na 10
    const userLimit: number = 10;

    //Filtriranje bukiranih termina od ovog korisnika
    const apps = await this.appointmentRepository.find({
      relations: { user: true },
      where: { user: { id: userId } },
    });
    if (apps.length < 1) return false;
    const appointments = apps.filter((app) => {
      return app.status === AppointmentStatusEnum.BOOKED;
    });
    //Ako korisnik ima bukiranih termina >= od limita, vraca true
    return appointments.length >= userLimit;
  }
  //Funkcija za provjeru radnog vremena salona
  async checkSalonOperatingHours(
    salonId: string,
    appointmentDate: Date,
    appointmentTime: string,
    duration: number,
  ): Promise<boolean> {
    //Ucitavanje salona
    const salon = await this.salonService.findById(salonId);
    //Racunanje kraja termina
    const endTime = this.calculateEndTime(appointmentTime, duration);

    const operatingHours = salon.operatingHours;
    //Pomocni niz za naziv dana
    const days: string[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    //Pronalazenje radnog vremena za taj dan
    const day: string = days[appointmentDate.getDay()];
    const salonHours = operatingHours.find(
      (hours) => hours.day === DayEnum[day.toUpperCase()],
    );
    //Ako termin uredno spada u radno vrijeme, vraca true
    return (
      appointmentTime > salonHours!.openTime &&
      appointmentTime < salonHours!.closeTime &&
      endTime > salonHours!.openTime &&
      endTime < salonHours!.closeTime
    );
  }
  //Pomocna funkcija za racunanje kraja termina
  calculateEndTime(startTime: string, duration: number): string {
    //Izdvajanje sati i minuta iz stringa
    let [stringHours, stringMinutes] = startTime.split(':', 2);
    //Konverzija sati i minuta u brojeve
    let hours = parseInt(stringHours, 10);
    let minutes = parseInt(stringMinutes, 10);
    //Dodavanje vremena trajanja na pocetak termina
    minutes += duration;
    if (minutes >= 60) {
      hours += Math.trunc(minutes / 60);
      minutes = minutes % 60;
    }
    //Konverzija sati i minuta u string
    stringHours = hours.toString();
    stringMinutes = minutes.toString();
    //Dodavanje nule ispred ako je jednocifren broj
    if (stringMinutes.length < 2) {
      stringMinutes = `0${minutes}`;
    }
    if (stringHours.length < 2) {
      stringHours = `0${hours}`;
    }
    //Vracanje kompletnog stringa u formatu HH:MM
    return `${stringHours}:${stringMinutes}`;
  }

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      relations: ['salon', 'service'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async addToPreviousSalons(userId: string, salonId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['previousSalons'],
    });

    if (!user) {
      throw new NotFoundException('Cannot find user!');
    }

    const alreadyVisited = user.previousSalons?.some(
      (salon) => salon.id === salonId,
    );

    if (!alreadyVisited) {
      const salon = await this.salonService.findById(salonId);
      user.previousSalons.push(salon);
      await this.usersRepository.save(user);
    }
  }

  async getAndSortAppointments(
    userId: string,
  ): Promise<{ upcoming: Appointment[]; past: Appointment[] }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allAppointments = await this.appointmentRepository.find({
      where: { user: { id: userId } },
      relations: ['salon', 'service'],
    });

    const upcoming = allAppointments
      .filter(
        (app) =>
          app.status === AppointmentStatusEnum.BOOKED &&
          app.appointmentDate >= today,
      )
      .sort(
        (a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime(),
      );

    const past = allAppointments
      .filter(
        (app) =>
          app.status === AppointmentStatusEnum.COMPLETED ||
          (app.status === AppointmentStatusEnum.BOOKED &&
            app.appointmentDate < today),
      )
      .sort(
        (a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime(),
      );

    return { upcoming, past };
  }

  async getUpcomingAppointments(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: Appointment[]; total: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [data, total] = await this.appointmentRepository.findAndCount({
      where: {
        user: { id: userId },
        status: AppointmentStatusEnum.BOOKED,
        appointmentDate: MoreThanOrEqual(today),
      },
      relations: ['salon', 'salon.category', 'service'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  async getPastAppointments(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: Appointment[]; total: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [data, total] = await this.appointmentRepository.findAndCount({
      where: [
        { user: { id: userId }, status: AppointmentStatusEnum.COMPLETED },
        {
          user: { id: userId },
          status: AppointmentStatusEnum.BOOKED,
          appointmentDate: LessThan(today),
        },
      ],
      relations: ['salon', 'salon.category', 'service'],
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }
}

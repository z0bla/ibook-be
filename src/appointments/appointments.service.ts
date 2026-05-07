import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
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

    const service = await this.servicesService.findById(serviceId);

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Cannot find user!');
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
    return newApp;
  }
  //Funkcija za provjeru preklapanja
  async checkOverlap(
    serviceId: string,
    appointmentDate: Date,
    appointmentTime: string,
    duration: number,
  ): Promise<boolean> {
    //Ucitavanje servisa
    const service = await this.servicesService.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Cannot find service!');
    }
    //Racunanje kraja termina
    const endTime = this.calculateEndTime(appointmentTime, duration);
    //Filtriranje termina koji vec postoje za ovaj dan
    const appointments = service.appointments.filter((app) => {
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
    //Ucitavanje servisa
    const service = await this.servicesService.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Cannot find service!');
    }
    //Filtriranje termina sa istim pocetnim vremenom za isti dan
    const appointments = service.appointments.filter((app) => {
      return (
        appointmentDate.getFullYear() === app.appointmentDate.getFullYear() &&
        appointmentDate.getMonth() === app.appointmentDate.getMonth() &&
        appointmentDate.getDate() === app.appointmentDate.getDate() &&
        appointmentTime === app.appointmentTime &&
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
    //Ucitavanje korisnika
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Cannot find user!');
    }
    //Filtriranje bukiranih termina od ovog korisnika
    const appointments = user.appointments.filter((app) => {
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
}

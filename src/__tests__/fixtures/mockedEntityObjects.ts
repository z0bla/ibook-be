import { Appointment } from '../../appointments/entities/appointment.entity';
import { Category } from '../../categories/entities/category.entity';
import { AppointmentStatusEnum } from '../../common/enums/appointment-status.enum';
import { DayEnum } from '../../common/enums/day.enum';
import { OperatingHours } from '../../operating-hours/entities/operating-hours.entity';
import { Salon } from '../../salons/entities/salon.entity';
import { Service } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';

export const mockedUserObject: User = {
  id: '123456789',
  name: 'user',
  phone: '111222333',
  email: 'dar@gmail.com',
  password: '345666787',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: new Date(),
  lastLogout: new Date(),
  appointments: [],
  previousSalons: [],
};
export const mockedCategoryObject: Category = {
  id: 'categoryid',
  name: 'name',
  icon: 'icon',
  description: 'description',
  createdAt: new Date(),
  salons: [],
};
export const mockedSalonObject: Salon = {
  id: 'salonid',
  name: 'name',
  address: 'address',
  phone: '123123123',
  description: 'description',
  rating: 0,
  reviewCount: 0,
  image: 'image',
  createdAt: new Date(),
  updatedAt: new Date(),
  category: mockedCategoryObject,
  operatingHours: [],
  services: [],
  users: [],
  appointments: [],
};
const app1: Appointment = {
  id: '1',
  appointmentDate: new Date('2026-03-08T10:00:00'),
  appointmentTime: '10:00:00',
  duration: 30,
  status: AppointmentStatusEnum.BOOKED,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUserObject,
  salon: mockedSalonObject,
  service: new Service(),
};
const app2: Appointment = {
  id: '2',
  appointmentDate: new Date('2026-03-08T10:30:00'),
  appointmentTime: '10:30:00',
  duration: 30,
  status: AppointmentStatusEnum.BOOKED,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUserObject,
  salon: mockedSalonObject,
  service: new Service(),
};
const app3: Appointment = {
  id: '3',
  appointmentDate: new Date('2026-03-08T11:00:00'),
  appointmentTime: '11:00:00',
  duration: 30,
  status: AppointmentStatusEnum.BOOKED,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUserObject,
  salon: mockedSalonObject,
  service: new Service(),
};
const app4: Appointment = {
  id: '4',
  appointmentDate: new Date('2026-03-08T11:00:00'),
  appointmentTime: '11:00:00',
  duration: 30,
  status: AppointmentStatusEnum.BOOKED,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUserObject,
  salon: mockedSalonObject,
  service: new Service(),
};
const app5: Appointment = {
  id: '5',
  appointmentDate: new Date('2026-03-08T11:00:00'),
  appointmentTime: '11:00:00',
  duration: 30,
  status: AppointmentStatusEnum.BOOKED,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUserObject,
  salon: mockedSalonObject,
  service: new Service(),
};
const app6: Appointment = {
  id: '6',
  appointmentDate: new Date('2026-03-08T11:00:00'),
  appointmentTime: '11:00:00',
  duration: 30,
  status: AppointmentStatusEnum.BOOKED,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUserObject,
  salon: mockedSalonObject,
  service: new Service(),
};

export const mockedServiceObject: Service = {
  id: 'serviceid',
  name: 'servicename',
  duration: 5,
  price: 10,
  createdAt: new Date(),
  salon: mockedSalonObject,
  appointments: [app1, app2, app3],
};
export const mockedServiceObjectWithConcurrentLimit = {
  ...mockedServiceObject,
  appointments: [app1, app2, app3, app4, app4, app4, app4],
};

export const mockedUserObjectWithAppLimitExceeded: User = {
  ...mockedUserObject,
  appointments: [
    app1,
    app2,
    app3,
    app4,
    app1,
    app2,
    app3,
    app4,
    app1,
    app2,
    app6,
    app5,
  ],
};
const operatingHours1: OperatingHours[] = [
  {
    id: '1',
    day: DayEnum.MONDAY,
    openTime: '07:00:00',
    closeTime: '15:00:00',
    isClosed: false,
    salon: mockedSalonObject,
  },
  {
    id: '2',
    day: DayEnum.TUESDAY,
    openTime: '07:00:00',
    closeTime: '15:00:00',
    isClosed: false,
    salon: mockedSalonObject,
  },
  {
    id: '3',
    day: DayEnum.WEDNESDAY,
    openTime: '07:00:00',
    closeTime: '15:00:00',
    isClosed: false,
    salon: mockedSalonObject,
  },
  {
    id: '4',
    day: DayEnum.THURSDAY,
    openTime: '07:00:00',
    closeTime: '15:00:00',
    isClosed: false,
    salon: mockedSalonObject,
  },
  {
    id: '5',
    day: DayEnum.FRIDAY,
    openTime: '07:00:00',
    closeTime: '15:00:00',
    isClosed: false,
    salon: mockedSalonObject,
  },
  {
    id: '6',
    day: DayEnum.SATURDAY,
    openTime: '08:00:00',
    closeTime: '12:00:00',
    isClosed: false,
    salon: mockedSalonObject,
  },
  {
    id: '7',
    day: DayEnum.SUNDAY,
    openTime: '00:00:00',
    closeTime: '00:00:00',
    isClosed: true,
    salon: mockedSalonObject,
  },
];
export const mockedSalonObjectWithOpHours: Salon = {
  ...mockedSalonObject,
  operatingHours: operatingHours1,
};

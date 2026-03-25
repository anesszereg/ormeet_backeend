import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

config();

// Entity imports
import { User, UserRole } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { Event, EventStatus, EventDateType, LocationType } from '../../entities/event.entity';
import { TicketType, TicketTypeEnum } from '../../entities/ticket-type.entity';
import { Order, OrderStatus, PaymentMethod } from '../../entities/order.entity';
import { Ticket, TicketStatus } from '../../entities/ticket.entity';
import { Attendance, CheckInMethod } from '../../entities/attendance.entity';
import { Venue } from '../../entities/venue.entity';
import { Review } from '../../entities/review.entity';
import { Promotion } from '../../entities/promotion.entity';
import { Media } from '../../entities/media.entity';
import { OrganizationInvitation } from '../../entities/organization-invitation.entity';
import { VerificationCode } from '../../entities/verification-code.entity';

// Create data source
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'event_organization_db',
  entities: [User, Organization, Event, TicketType, Order, Ticket, Attendance, Venue, Review, Promotion, Media, OrganizationInvitation, VerificationCode],
  synchronize: true,
  logging: true,
});

async function seed() {
  console.log('🌱 Starting database seed...');
  
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const userRepo = AppDataSource.getRepository(User);
  const orgRepo = AppDataSource.getRepository(Organization);
  const eventRepo = AppDataSource.getRepository(Event);
  const ticketTypeRepo = AppDataSource.getRepository(TicketType);
  const orderRepo = AppDataSource.getRepository(Order);
  const ticketRepo = AppDataSource.getRepository(Ticket);
  const attendanceRepo = AppDataSource.getRepository(Attendance);

  try {
    // ========== 1. CREATE USERS ==========
    console.log('👤 Creating users...');
    
    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    // Organizer user
    const organizer = userRepo.create({
      id: uuidv4(),
      name: 'Abdeslam Azzoun',
      email: 'organizer@ormeet.com',
      passwordHash,
      phone: '+1234567890',
      roles: [UserRole.ORGANIZER],
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
    await userRepo.save(organizer);
    console.log(`  ✅ Created organizer: ${organizer.email}`);

    // Attendee users (from mock data)
    const attendeeData = [
      { name: 'John Doe', email: 'johndoe@gmail.com' },
      { name: 'Sarah Smith', email: 'sarahsmith@gmail.com' },
      { name: 'Emily Taylor', email: 'emilytaylor@gmail.com' },
      { name: 'Christopher Remington', email: 'christopheremington@gmail.com' },
      { name: 'Jenny Whitmore', email: 'genevievewhitmore@gmail.com' },
      { name: 'Alexander Harrison', email: 'alexanderharrison@gmail.com' },
      { name: 'Michael Johnson', email: 'michaeljohnson@gmail.com' },
      { name: 'Jessica Brown', email: 'jessicabrown@gmail.com' },
      { name: 'David Wilson', email: 'davidwilson@gmail.com' },
      { name: 'Lisa Anderson', email: 'lisaanderson@gmail.com' },
    ];

    const attendees: User[] = [];
    for (const data of attendeeData) {
      const user = userRepo.create({
        id: uuidv4(),
        name: data.name,
        email: data.email,
        passwordHash,
        roles: [UserRole.ATTENDEE],
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
      await userRepo.save(user);
      attendees.push(user);
      console.log(`  ✅ Created attendee: ${user.email}`);
    }

    // ========== 2. CREATE ORGANIZATION ==========
    console.log('🏢 Creating organization...');
    
    const organization = orgRepo.create({
      id: uuidv4(),
      name: 'Ormeet Events',
      description: 'Premier event organization company',
      website: 'https://ormeet.com',
      contactEmail: 'contact@ormeet.com',
      contactPhone: '+1234567890',
      ownerId: organizer.id,
    });
    await orgRepo.save(organization);
    console.log(`  ✅ Created organization: ${organization.name}`);

    // Update organizer with organization
    organizer.organizationId = organization.id;
    await userRepo.save(organizer);

    // ========== 3. CREATE EVENTS (from EventsTable mock data) ==========
    console.log('📅 Creating events...');

    const eventsData = [
      {
        title: 'Moonlight Melodies',
        shortDescription: 'An enchanting evening of live music under the moonlight',
        longDescription: 'Join us for an enchanting evening of live music under the moonlight at the iconic Seaside Pavilion. Featuring world-class jazz musicians, soulful vocalists, and an unforgettable atmosphere by the ocean.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '1600 Ocean Front Walk', city: 'Santa Monica', state: 'California', zipCode: '90401', postalCode: '90401', country: 'United States' },
        startAt: new Date('2025-06-21T19:00:00'),
        endAt: new Date('2025-06-21T23:00:00'),
        capacity: 300,
        tickets: [
          { title: 'General Admission', price: 45, quantity: 200, type: TicketTypeEnum.GENERAL },
          { title: 'VIP', price: 120, quantity: 50, type: TicketTypeEnum.VIP },
          { title: 'Early Bird', price: 35, quantity: 50, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Rooftop Rhythms',
        shortDescription: 'Ultimate rooftop party with stunning Manhattan views',
        longDescription: 'Experience the ultimate rooftop party with stunning views of the Manhattan skyline. Rooftop Rhythms brings together the hottest DJs spinning house, techno, and deep house beats all night long.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '250 Ashland Pl', city: 'Brooklyn', state: 'New York', zipCode: '11217', postalCode: '11217', country: 'United States' },
        startAt: new Date('2025-08-02T20:00:00'),
        endAt: new Date('2025-08-03T02:00:00'),
        capacity: 300,
        tickets: [
          { title: 'General Admission', price: 55, quantity: 200, type: TicketTypeEnum.GENERAL },
          { title: 'VIP Table', price: 500, quantity: 20, type: TicketTypeEnum.VIP },
        ],
      },
      {
        title: 'Harmony Under The Stars',
        shortDescription: 'Acoustic performances in Sedona red rocks',
        longDescription: 'A magical evening of acoustic performances set against the breathtaking backdrop of Sedona\'s red rocks. Featuring Grammy-nominated artists performing intimate sets under the desert stars.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '525 Boynton Canyon Rd', city: 'Sedona', state: 'Arizona', zipCode: '86336', postalCode: '86336', country: 'United States' },
        startAt: new Date('2025-05-26T18:00:00'),
        endAt: new Date('2025-05-26T22:00:00'),
        capacity: 300,
        tickets: [
          { title: 'Standard', price: 85, quantity: 250, type: TicketTypeEnum.GENERAL },
          { title: 'Premium', price: 150, quantity: 50, type: TicketTypeEnum.VIP },
        ],
      },
      {
        title: 'Tech Innovation Summit',
        shortDescription: 'Two days of keynotes, workshops, and networking',
        longDescription: 'Join industry leaders and innovators for two days of keynotes, workshops, and networking at the Tech Innovation Summit. Topics include AI, blockchain, cloud computing, and the future of work.',
        category: 'Tech',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '150 W San Carlos St', city: 'San Jose', state: 'California', zipCode: '95113', postalCode: '95113', country: 'United States' },
        onlineLink: 'https://zoom.us/meeting/tech-summit-2025',
        startAt: new Date('2025-06-21T09:00:00'),
        endAt: new Date('2025-06-22T18:00:00'),
        capacity: 800,
        tickets: [
          { title: 'In-Person', price: 299, quantity: 200, type: TicketTypeEnum.GENERAL },
          { title: 'Virtual', price: 99, quantity: 500, type: TicketTypeEnum.GENERAL },
          { title: 'Student', price: 49, quantity: 100, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Startup Pitch Night',
        shortDescription: 'Watch promising startups pitch to investors',
        longDescription: 'Watch 10 promising startups pitch their ideas to a panel of investors and industry experts. Network with entrepreneurs, investors, and fellow innovators. Cash prizes for the top 3 pitches!',
        category: 'Business',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '120 Water St', city: 'Brooklyn', state: 'New York', zipCode: '11201', postalCode: '11201', country: 'United States' },
        startAt: new Date('2025-08-02T18:00:00'),
        endAt: new Date('2025-08-02T21:00:00'),
        capacity: 150,
        tickets: [
          { title: 'General', price: 25, quantity: 100, type: TicketTypeEnum.GENERAL },
          { title: 'Investor Pass', price: 100, quantity: 50, type: TicketTypeEnum.VIP },
        ],
      },
      {
        title: 'AI Expo 2025',
        shortDescription: 'Explore the latest in artificial intelligence',
        longDescription: 'Discover cutting-edge AI technologies, attend workshops, and network with industry leaders at AI Expo 2025.',
        category: 'Tech',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '747 Howard St', city: 'San Francisco', state: 'California', zipCode: '94103', postalCode: '94103', country: 'United States' },
        startAt: new Date('2025-04-20T09:00:00'),
        endAt: new Date('2025-04-21T18:00:00'),
        capacity: 500,
        tickets: [
          { title: 'Early Bird', price: 75, quantity: 200, type: TicketTypeEnum.EARLY_BIRD },
          { title: 'General', price: 100, quantity: 300, type: TicketTypeEnum.GENERAL },
        ],
      },
      {
        title: 'Music Fest LA',
        shortDescription: 'Three days of non-stop music in Los Angeles',
        longDescription: 'Experience three days of incredible live music featuring top artists from around the world at Music Fest LA.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '3939 S Figueroa St', city: 'Los Angeles', state: 'California', zipCode: '90037', postalCode: '90037', country: 'United States' },
        startAt: new Date('2025-04-28T14:00:00'),
        endAt: new Date('2025-04-30T23:00:00'),
        capacity: 1000,
        tickets: [
          { title: 'VIP', price: 250, quantity: 100, type: TicketTypeEnum.VIP },
          { title: 'General', price: 75, quantity: 900, type: TicketTypeEnum.GENERAL },
        ],
      },
      {
        title: 'Business Conference',
        shortDescription: 'Annual business leadership conference',
        longDescription: 'Join business leaders and entrepreneurs for insights on leadership, strategy, and innovation.',
        category: 'Business',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { address: '655 W 34th St', city: 'New York', state: 'New York', zipCode: '10001', postalCode: '10001', country: 'United States' },
        startAt: new Date('2025-05-05T08:00:00'),
        endAt: new Date('2025-05-06T17:00:00'),
        capacity: 400,
        tickets: [
          { title: 'Early Bird', price: 199, quantity: 100, type: TicketTypeEnum.EARLY_BIRD },
          { title: 'General', price: 299, quantity: 300, type: TicketTypeEnum.GENERAL },
        ],
      },
    ];

    const events: Event[] = [];
    const allTicketTypes: TicketType[] = [];

    for (const eventData of eventsData) {
      const event = eventRepo.create({
        id: uuidv4(),
        title: eventData.title,
        shortDescription: eventData.shortDescription,
        longDescription: eventData.longDescription,
        organizerId: organization.id,
        status: eventData.status,
        category: eventData.category,
        locationType: eventData.locationType,
        customLocation: eventData.customLocation,
        onlineLink: eventData.onlineLink,
        dateType: EventDateType.ONE_TIME,
        startAt: eventData.startAt,
        endAt: eventData.endAt,
        capacity: eventData.capacity,
        views: Math.floor(Math.random() * 1000),
        favorites: Math.floor(Math.random() * 100),
        publishedAt: new Date(),
      });
      await eventRepo.save(event);
      events.push(event);
      console.log(`  ✅ Created event: ${event.title}`);

      // Create ticket types for this event
      for (const ticketData of eventData.tickets) {
        const ticketType = ticketTypeRepo.create({
          id: uuidv4(),
          eventId: event.id,
          title: ticketData.title,
          price: ticketData.price,
          quantityTotal: ticketData.quantity,
          quantitySold: Math.floor(ticketData.quantity * 0.5), // 50% sold
          type: ticketData.type,
          isFree: ticketData.price === 0,
        });
        await ticketTypeRepo.save(ticketType);
        allTicketTypes.push(ticketType);
        console.log(`    📎 Created ticket type: ${ticketType.title} ($${ticketType.price})`);
      }
    }

    // ========== 4. CREATE ORDERS (from OrdersTable mock data) ==========
    console.log('🛒 Creating orders...');

    const orderStatuses = [OrderStatus.PAID, OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PENDING, OrderStatus.PAID];
    const orders: Order[] = [];

    for (let i = 0; i < 12; i++) {
      const attendee = attendees[i % attendees.length];
      const event = events[i % events.length];
      const ticketType = allTicketTypes.find(t => t.eventId === event.id) || allTicketTypes[0];
      const qty = Math.floor(Math.random() * 3) + 1;
      const subtotal = ticketType.price * qty;
      const serviceFee = subtotal * 0.05;
      const total = subtotal + serviceFee;

      const order = orderRepo.create({
        id: uuidv4(),
        userId: attendee.id,
        eventId: event.id,
        items: [{ ticketTypeId: ticketType.id, quantity: qty, unitPrice: Number(ticketType.price) }],
        amountSubtotal: subtotal,
        serviceFee: serviceFee,
        amountTotal: total,
        currency: 'USD',
        status: orderStatuses[i % orderStatuses.length],
        paymentMethod: PaymentMethod.CREDIT_CARD,
        billingName: attendee.name,
        billingEmail: attendee.email,
        paidAt: orderStatuses[i % orderStatuses.length] === OrderStatus.PAID ? new Date() : undefined,
      });
      await orderRepo.save(order);
      orders.push(order);
      console.log(`  ✅ Created order for ${attendee.name} - ${event.title} ($${total.toFixed(2)})`);

      // Create tickets for paid orders
      if (order.status === OrderStatus.PAID) {
        for (let j = 0; j < qty; j++) {
          const ticket = ticketRepo.create({
            id: uuidv4(),
            ticketTypeId: ticketType.id,
            eventId: event.id,
            orderId: order.id,
            ownerId: attendee.id,
            code: `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            status: TicketStatus.ACTIVE,
            issuedAt: new Date(),
          });
          await ticketRepo.save(ticket);
          console.log(`    🎫 Created ticket: ${ticket.code}`);

          // Create attendance for some tickets (checked-in)
          if (Math.random() > 0.4) {
            const attendance = attendanceRepo.create({
              id: uuidv4(),
              ticketId: ticket.id,
              eventId: event.id,
              checkedInAt: new Date(),
              method: CheckInMethod.QR,
            });
            await attendanceRepo.save(attendance);
            console.log(`    ✓ Checked in: ${ticket.code}`);
          }
        }
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('=====================================');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${attendees.length + 1}`);
    console.log(`   - Organizations: 1`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Ticket Types: ${allTicketTypes.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log('=====================================');
    console.log('\n🔐 Login credentials:');
    console.log(`   Organizer: organizer@ormeet.com / Password123!`);
    console.log(`   Attendee:  johndoe@gmail.com / Password123!`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch(console.error);

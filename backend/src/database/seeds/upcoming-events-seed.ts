import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

// Entity imports
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { Event, EventStatus, LocationType } from '../../entities/event.entity';
import { TicketType, TicketTypeEnum } from '../../entities/ticket-type.entity';
import { Ticket } from '../../entities/ticket.entity';
import { Order } from '../../entities/order.entity';
import { Venue } from '../../entities/venue.entity';
import { Review } from '../../entities/review.entity';
import { Attendance } from '../../entities/attendance.entity';
import { Promotion } from '../../entities/promotion.entity';
import { Media } from '../../entities/media.entity';

// Create data source
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://mac@localhost:5432/event_organization_db',
  entities: [User, Organization, Event, TicketType, Ticket, Order, Venue, Review, Attendance, Promotion, Media],
  synchronize: false,
  logging: false,
});

async function seed() {
  console.log('🌱 Starting upcoming events seed...');
  
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const eventRepo = AppDataSource.getRepository(Event);
  const ticketTypeRepo = AppDataSource.getRepository(TicketType);
  const orgRepo = AppDataSource.getRepository(Organization);

  try {
    // Get existing organization (assuming one exists from previous seed)
    const organization = await orgRepo.findOne({ where: {} });
    if (!organization) {
      console.error('❌ No organization found. Please run organizer-seed first.');
      process.exit(1);
    }

    console.log(`📅 Creating upcoming events for: ${organization.name}`);

    const upcomingEvents = [
      {
        title: 'Summer Music Festival 2026',
        shortDescription: 'Three-day outdoor music festival featuring 50+ artists',
        longDescription: 'The biggest summer music festival returns! Experience three unforgettable days of live music across 5 stages featuring rock, pop, EDM, hip-hop, and indie artists. Food trucks, art installations, and camping available.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Golden Gate Park', 
          city: 'San Francisco', 
          state: 'California', 
          zipCode: '94122', 
          postalCode: '94122', 
          country: 'United States' 
        },
        startAt: new Date('2026-07-10T12:00:00'),
        endAt: new Date('2026-07-12T23:00:00'),
        capacity: 50000,
        images: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3'],
        tickets: [
          { title: 'General Admission - 3 Day Pass', price: 299, quantity: 30000, type: TicketTypeEnum.GENERAL },
          { title: 'VIP - 3 Day Pass', price: 799, quantity: 5000, type: TicketTypeEnum.VIP },
          { title: 'Early Bird - 3 Day Pass', price: 249, quantity: 10000, type: TicketTypeEnum.EARLY_BIRD },
          { title: 'Single Day Pass', price: 129, quantity: 5000, type: TicketTypeEnum.GENERAL },
        ],
      },
      {
        title: 'AI & Machine Learning Conference 2026',
        shortDescription: 'Leading conference on artificial intelligence and ML innovations',
        longDescription: 'Join 5,000+ AI professionals, researchers, and enthusiasts for the premier AI conference. Featuring keynotes from OpenAI, Google DeepMind, and Meta AI. Hands-on workshops, networking sessions, and startup showcase.',
        category: 'Tech',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Moscone Center', 
          city: 'San Francisco', 
          state: 'California', 
          zipCode: '94103', 
          postalCode: '94103', 
          country: 'United States' 
        },
        onlineLink: 'https://zoom.us/ai-ml-conf-2026',
        startAt: new Date('2026-05-15T09:00:00'),
        endAt: new Date('2026-05-17T18:00:00'),
        capacity: 5000,
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87'],
        tickets: [
          { title: 'In-Person Pass', price: 899, quantity: 2000, type: TicketTypeEnum.GENERAL },
          { title: 'Virtual Pass', price: 299, quantity: 2500, type: TicketTypeEnum.GENERAL },
          { title: 'Student Pass', price: 199, quantity: 500, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Food & Wine Festival',
        shortDescription: 'Culinary celebration with celebrity chefs and wine tastings',
        longDescription: 'Indulge in a weekend of gourmet food and fine wines. Meet celebrity chefs, attend cooking demonstrations, enjoy wine tastings from 100+ wineries, and savor dishes from the best restaurants in the region.',
        category: 'Food & Drink',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Napa Valley Expo', 
          city: 'Napa', 
          state: 'California', 
          zipCode: '94559', 
          postalCode: '94559', 
          country: 'United States' 
        },
        startAt: new Date('2026-09-18T11:00:00'),
        endAt: new Date('2026-09-20T20:00:00'),
        capacity: 10000,
        images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0'],
        tickets: [
          { title: 'Weekend Pass', price: 175, quantity: 5000, type: TicketTypeEnum.GENERAL },
          { title: 'VIP Tasting Pass', price: 350, quantity: 2000, type: TicketTypeEnum.VIP },
          { title: 'Saturday Only', price: 95, quantity: 2000, type: TicketTypeEnum.GENERAL },
          { title: 'Sunday Only', price: 95, quantity: 1000, type: TicketTypeEnum.GENERAL },
        ],
      },
      {
        title: 'Marathon & 5K Run',
        shortDescription: 'Annual charity marathon supporting local communities',
        longDescription: 'Run for a cause! Join thousands of runners in our annual marathon and 5K charity run. All proceeds support local schools and community programs. Professional timing, medals for all finishers, and post-race celebration.',
        category: 'Sports',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Central Park', 
          city: 'New York', 
          state: 'New York', 
          zipCode: '10024', 
          postalCode: '10024', 
          country: 'United States' 
        },
        startAt: new Date('2026-04-25T07:00:00'),
        endAt: new Date('2026-04-25T14:00:00'),
        capacity: 15000,
        images: ['https://images.unsplash.com/photo-1452626038306-9aae5e071dd3'],
        tickets: [
          { title: 'Marathon Entry', price: 85, quantity: 5000, type: TicketTypeEnum.GENERAL },
          { title: '5K Entry', price: 35, quantity: 8000, type: TicketTypeEnum.GENERAL },
          { title: 'Early Bird Marathon', price: 65, quantity: 2000, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Comic Con 2026',
        shortDescription: 'Ultimate pop culture convention with celebrity guests',
        longDescription: 'The biggest pop culture event of the year! Meet your favorite actors, comic artists, and creators. Exclusive panels, cosplay competitions, gaming tournaments, artist alley, and merchandise from 500+ vendors.',
        category: 'Entertainment',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'San Diego Convention Center', 
          city: 'San Diego', 
          state: 'California', 
          zipCode: '92101', 
          postalCode: '92101', 
          country: 'United States' 
        },
        startAt: new Date('2026-07-23T10:00:00'),
        endAt: new Date('2026-07-26T19:00:00'),
        capacity: 130000,
        images: ['https://images.unsplash.com/photo-1608889476561-6242cfdbf622'],
        tickets: [
          { title: '4-Day Pass', price: 275, quantity: 50000, type: TicketTypeEnum.GENERAL },
          { title: 'Single Day Pass', price: 85, quantity: 60000, type: TicketTypeEnum.GENERAL },
          { title: 'VIP Experience', price: 1200, quantity: 5000, type: TicketTypeEnum.VIP },
          { title: 'Preview Night', price: 65, quantity: 15000, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Yoga & Wellness Retreat',
        shortDescription: 'Weekend wellness retreat in the mountains',
        longDescription: 'Escape to the mountains for a transformative wellness weekend. Daily yoga sessions, meditation workshops, spa treatments, organic farm-to-table meals, and nature hikes. All levels welcome.',
        category: 'Health & Wellness',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Mountain Retreat Center', 
          city: 'Boulder', 
          state: 'Colorado', 
          zipCode: '80302', 
          postalCode: '80302', 
          country: 'United States' 
        },
        startAt: new Date('2026-06-05T15:00:00'),
        endAt: new Date('2026-06-07T12:00:00'),
        capacity: 100,
        images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773'],
        tickets: [
          { title: 'Shared Accommodation', price: 450, quantity: 60, type: TicketTypeEnum.GENERAL },
          { title: 'Private Room', price: 750, quantity: 30, type: TicketTypeEnum.VIP },
          { title: 'Day Pass (No Accommodation)', price: 150, quantity: 10, type: TicketTypeEnum.GENERAL },
        ],
      },
      {
        title: 'Jazz Night at the Blue Note',
        shortDescription: 'Intimate jazz performance with Grammy winners',
        longDescription: 'Experience an unforgettable evening of jazz at the legendary Blue Note. Featuring Grammy-winning artists performing classic and contemporary jazz. Premium cocktails and dinner service available.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: '131 W 3rd St', 
          city: 'New York', 
          state: 'New York', 
          zipCode: '10012', 
          postalCode: '10012', 
          country: 'United States' 
        },
        startAt: new Date('2026-05-08T20:00:00'),
        endAt: new Date('2026-05-08T23:30:00'),
        capacity: 200,
        images: ['https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f'],
        tickets: [
          { title: 'General Seating', price: 65, quantity: 120, type: TicketTypeEnum.GENERAL },
          { title: 'Premium Table', price: 150, quantity: 40, type: TicketTypeEnum.VIP },
          { title: 'VIP Front Row', price: 250, quantity: 20, type: TicketTypeEnum.VIP },
          { title: 'Dinner & Show Package', price: 195, quantity: 20, type: TicketTypeEnum.VIP },
        ],
      },
      {
        title: 'Startup Founders Bootcamp',
        shortDescription: 'Intensive 3-day workshop for aspiring entrepreneurs',
        longDescription: 'Transform your startup idea into reality. Learn from successful founders, pitch to investors, build your MVP, and connect with co-founders. Includes mentorship sessions, networking dinners, and pitch competition with $50K prize.',
        category: 'Business',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'WeWork Tower', 
          city: 'Austin', 
          state: 'Texas', 
          zipCode: '78701', 
          postalCode: '78701', 
          country: 'United States' 
        },
        startAt: new Date('2026-08-14T09:00:00'),
        endAt: new Date('2026-08-16T18:00:00'),
        capacity: 150,
        images: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd'],
        tickets: [
          { title: 'Founder Pass', price: 599, quantity: 100, type: TicketTypeEnum.GENERAL },
          { title: 'Team Pass (3 people)', price: 1499, quantity: 30, type: TicketTypeEnum.GENERAL },
          { title: 'Early Bird', price: 449, quantity: 20, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Art Gallery Opening: Modern Expressions',
        shortDescription: 'Exclusive opening of contemporary art exhibition',
        longDescription: 'Be among the first to experience "Modern Expressions" - a groundbreaking exhibition featuring 50+ contemporary artists. Meet the artists, enjoy champagne reception, and exclusive first purchase opportunities.',
        category: 'Arts & Culture',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Museum of Modern Art', 
          city: 'Los Angeles', 
          state: 'California', 
          zipCode: '90012', 
          postalCode: '90012', 
          country: 'United States' 
        },
        startAt: new Date('2026-06-12T18:00:00'),
        endAt: new Date('2026-06-12T22:00:00'),
        capacity: 300,
        images: ['https://images.unsplash.com/photo-1531243269054-5ebf6f34081e'],
        tickets: [
          { title: 'General Admission', price: 45, quantity: 200, type: TicketTypeEnum.GENERAL },
          { title: 'VIP Preview', price: 125, quantity: 50, type: TicketTypeEnum.VIP },
          { title: 'Patron Circle', price: 500, quantity: 30, type: TicketTypeEnum.VIP },
          { title: 'Student/Senior', price: 25, quantity: 20, type: TicketTypeEnum.EARLY_BIRD },
        ],
      },
      {
        title: 'Electronic Dance Music Festival',
        shortDescription: 'Massive EDM festival with world-class DJs',
        longDescription: 'The ultimate EDM experience! Two nights of non-stop electronic music featuring the world\'s top DJs. State-of-the-art production, immersive light shows, multiple stages, and unforgettable vibes.',
        category: 'Music',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Las Vegas Motor Speedway', 
          city: 'Las Vegas', 
          state: 'Nevada', 
          zipCode: '89115', 
          postalCode: '89115', 
          country: 'United States' 
        },
        startAt: new Date('2026-10-16T18:00:00'),
        endAt: new Date('2026-10-18T04:00:00'),
        capacity: 100000,
        images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'],
        tickets: [
          { title: '2-Day GA Pass', price: 349, quantity: 70000, type: TicketTypeEnum.GENERAL },
          { title: '2-Day VIP Pass', price: 899, quantity: 15000, type: TicketTypeEnum.VIP },
          { title: 'Early Bird GA', price: 279, quantity: 10000, type: TicketTypeEnum.EARLY_BIRD },
          { title: 'Platinum Experience', price: 2499, quantity: 5000, type: TicketTypeEnum.VIP },
        ],
      },
      {
        title: 'Virtual Reality Gaming Expo',
        shortDescription: 'Experience the future of gaming with VR demos',
        longDescription: 'Step into the future of gaming! Try the latest VR games and hardware, meet game developers, attend esports tournaments, and be the first to experience unreleased VR titles. Gaming competitions with cash prizes.',
        category: 'Gaming',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Los Angeles Convention Center', 
          city: 'Los Angeles', 
          state: 'California', 
          zipCode: '90015', 
          postalCode: '90015', 
          country: 'United States' 
        },
        startAt: new Date('2026-11-06T10:00:00'),
        endAt: new Date('2026-11-08T20:00:00'),
        capacity: 25000,
        images: ['https://images.unsplash.com/photo-1535223289827-42f1e9919769'],
        tickets: [
          { title: '3-Day Pass', price: 129, quantity: 15000, type: TicketTypeEnum.GENERAL },
          { title: 'Single Day', price: 55, quantity: 8000, type: TicketTypeEnum.GENERAL },
          { title: 'VIP All Access', price: 299, quantity: 2000, type: TicketTypeEnum.VIP },
        ],
      },
      {
        title: 'Photography Workshop: Landscape Mastery',
        shortDescription: 'Professional photography workshop in Yosemite',
        longDescription: 'Master landscape photography with award-winning photographers in Yosemite National Park. Hands-on instruction, sunrise/sunset shoots, post-processing workshops, and portfolio reviews. All skill levels welcome.',
        category: 'Education',
        status: EventStatus.PUBLISHED,
        locationType: LocationType.PHYSICAL,
        customLocation: { 
          address: 'Yosemite Valley', 
          city: 'Yosemite National Park', 
          state: 'California', 
          zipCode: '95389', 
          postalCode: '95389', 
          country: 'United States' 
        },
        startAt: new Date('2026-09-25T14:00:00'),
        endAt: new Date('2026-09-27T12:00:00'),
        capacity: 30,
        images: ['https://images.unsplash.com/photo-1452587925148-ce544e77e70d'],
        tickets: [
          { title: 'Workshop + Camping', price: 799, quantity: 20, type: TicketTypeEnum.GENERAL },
          { title: 'Workshop + Hotel', price: 1299, quantity: 10, type: TicketTypeEnum.VIP },
        ],
      },
    ];

    for (const eventData of upcomingEvents) {
      const event = eventRepo.create({
        id: uuidv4(),
        title: eventData.title,
        shortDescription: eventData.shortDescription,
        longDescription: eventData.longDescription,
        category: eventData.category,
        status: eventData.status,
        locationType: eventData.locationType,
        customLocation: eventData.customLocation,
        onlineLink: eventData.onlineLink,
        startAt: eventData.startAt,
        endAt: eventData.endAt,
        capacity: eventData.capacity,
        images: eventData.images,
        organizerId: organization.id,
        allowReentry: true,
        refundsAllowed: true,
        views: Math.floor(Math.random() * 5000),
        favorites: Math.floor(Math.random() * 500),
      });

      const savedEvent = await eventRepo.save(event);
      console.log(`  ✅ Created event: ${savedEvent.title}`);

      // Create ticket types for this event
      for (const ticketData of eventData.tickets) {
        const ticketType = ticketTypeRepo.create({
          eventId: savedEvent.id,
          title: ticketData.title,
          price: ticketData.price,
          quantityTotal: ticketData.quantity,
          quantitySold: 0,
          type: ticketData.type,
        });
        await ticketTypeRepo.save(ticketType);
        console.log(`    🎫 Created ticket type: ${ticketType.title} - $${ticketType.price}`);
      }
    }

    console.log('\n✅ Upcoming events seed completed successfully!');
    console.log(`📊 Total events created: ${upcomingEvents.length}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('🎉 Seed process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed process failed:', error);
    process.exit(1);
  });

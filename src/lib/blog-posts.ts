export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-we-started-midnight-smashers",
    title: "Why we started Midnight Smashers",
    date: "2026-01-08",
    excerpt:
      "Late night delivery should not mean sad drive thru bags. We wanted smash burgers you actually want at midnight.",
    paragraphs: [
      "We kept talking about how hard it is to get a good burger after the kitchen closes at most sit down spots. Delivery apps are full of options, but not many feel like someone cared when they packed the bag.",
      "Midnight Smashers is our answer: two burgers, done right, built for delivery around Littleton, Englewood, and Sheridan. We are keeping the menu tiny on purpose so we can focus on the smash, the cheese pull, and the sauce.",
      "We are still in build mode, but we wanted this site live so you can see what we are cooking toward. Thanks for reading while we finish the last details.",
    ],
  },
  {
    slug: "griddle-shopping-and-test-patties",
    title: "Griddle shopping and way too many test patties",
    date: "2026-01-15",
    excerpt:
      "Turns out not every flat top loves smash burgers. We burned a lot of onions learning that.",
    paragraphs: [
      "If you have never shopped for a griddle as a normal person, the internet will try to sell you a twelve foot range. We needed something that fits our line, holds heat, and survives late night volume.",
      "We ran test batches with friends and family until the crust looked right and the timing felt boringly consistent. Boring is good here. You want the same burger at 8 pm and 1 am.",
      "Next up is locking in our hold temps and finishing the pickup flow for delivery handoff. Still messy, still fun.",
    ],
  },
  {
    slug: "house-sauce-first-real-batch",
    title: "House sauce: first batch that tasted like us",
    date: "2026-01-22",
    excerpt:
      "We went through a lot of mayo and pickles to land on a sauce that is tangy, not sweet weird.",
    paragraphs: [
      "Every smash spot lives or dies on the little cup of sauce. We wanted something that cuts through the fat without tasting like candy.",
      "Batch one was too sharp. Batch two was too mild. Batch three made us quiet at the table, which is how we knew we were close.",
      "We will keep tweaking in tiny steps, but the base is set. If you order later this year, this is the flavor we are chasing.",
    ],
  },
  {
    slug: "brioche-buns-on-the-way",
    title: "Brioche buns are on the way",
    date: "2026-01-29",
    excerpt:
      "We locked in a bun that holds up in a bag without turning into a sponge.",
    paragraphs: [
      "Delivery is a stress test for bread. A bun that looks good on a plate can fall apart in steam and foil.",
      "We sampled local bakers and a few regional suppliers. The winner toasts well, fits the patty size we smash, and does not fight the onions.",
      "Freight and par levels are the next boring part. Exciting for us, not for a blog post.",
    ],
  },
  {
    slug: "uber-eats-and-doordash-paperwork",
    title: "Uber Eats, DoorDash, and a mountain of paperwork",
    date: "2026-02-05",
    excerpt:
      "Menus, photos, hours, insurance. Opening online is not just flipping a switch.",
    paragraphs: [
      "We are working through store setup on both platforms so you can order wherever you already have an account. That means matching the menu to exactly what we can execute at 2 am with two burgers.",
      "Photos are coming. We are not going to use stock shots that look nothing like the real thing.",
      "If you see placeholder links on the site for a bit, that is us finishing the last compliance steps.",
    ],
  },
  {
    slug: "friends-and-family-tasting-night",
    title: "Friends and family tasting night",
    date: "2026-02-12",
    excerpt:
      "We filled the room with honest people who are not afraid to say the sauce is too salty.",
    paragraphs: [
      "We kept the group small: neighbors, a few regulars from the staple we are connected to, and one picky teenager who only eats burgers.",
      "Feedback was loud and useful. We adjusted salt on the patty, tweaked onion dice size, and confirmed the double is worth the price when you are hungry.",
      "Thank you to everyone who showed up messy and hungry. We will do it again before we open.",
    ],
  },
  {
    slug: "neon-branding-and-logo-tweaks",
    title: "Neon, branding, and the logo that will live on bags",
    date: "2026-02-19",
    excerpt:
      "If it does not read on a phone screen at 1 am, it does not ship.",
    paragraphs: [
      "We wanted the brand to feel like late night, not a corporate deck. The colors you see on this site are the same direction we are taking for stickers, bags, and the small sign at the window.",
      "Font choices matter when people are half awake. High contrast, simple words, no tiny disclaimers in all caps.",
      "We are still deciding on a few final assets, but the vibe is locked.",
    ],
  },
  {
    slug: "south-denver-delivery-zone",
    title: "South Denver delivery zone: how we drew the map",
    date: "2026-02-26",
    excerpt:
      "We focused on Littleton, Englewood, and Sheridan first, then expanded carefully.",
    paragraphs: [
      "Late night food only works if the food arrives hot. That means we start with a zone we can cover reliably, then grow when we can add drivers or shorten routes.",
      "Apps help with routing, but we still think about real roads, construction, and how long it takes to get out of a parking lot at closing time.",
      "If you are outside the zone today, keep the site bookmarked. We will post when we widen the radius.",
    ],
  },
  {
    slug: "double-smash-timing",
    title: "Double smash timing: how we keep both patties crisp",
    date: "2026-03-05",
    excerpt:
      "Two patties means two smashes, two flips, and one bun that still closes.",
    paragraphs: [
      "We are not trying to win a speed contest. We are trying to hit the same crust on both patties without overcooking the cheese.",
      "That means staging on the grill, a clear order of operations, and a timer that matches real life, not a YouTube short.",
      "Line tests will continue until we can do it tired, with music loud, and someone asking for extra sauce.",
    ],
  },
  {
    slug: "hiring-the-night-crew",
    title: "Hiring the night crew",
    date: "2026-03-12",
    excerpt:
      "We want people who like late shifts and can handle a small menu with big standards.",
    paragraphs: [
      "Small menu does not mean small effort. We need folks who can show up, stay calm, and keep the station clean when the rush hits after the bars.",
      "Training will focus on food safety first, then speed, then the small details that make a repeat customer.",
      "If you are local and interested, watch this space. We will post when applications open.",
    ],
  },
  {
    slug: "permits-inspections-checklists",
    title: "Permits, inspections, and checklists we never knew existed",
    date: "2026-03-19",
    excerpt:
      "Opening is half cooking and half clipboards. We are doing the work.",
    paragraphs: [
      "Every city has its own rhythm for health permits and fire inspections. We are walking through the steps with the same patience we used on the sauce recipe.",
      "Nothing here is a shortcut. If we are going to ask you to order at midnight, we owe you a kitchen that meets the rules.",
      "We will share a real opening date once we have a signed off runbook and a crew schedule that makes sense.",
    ],
  },
  {
    slug: "almost-launch-soft-opening-soon",
    title: "Almost launch: soft opening soon",
    date: "2026-03-26",
    excerpt:
      "We are close. Final menu lock, final photos, final training day.",
    paragraphs: [
      "This week is about repeating the same service window until it feels boring. Boring is the goal. Boring means we can handle surprises.",
      "We are lining up a soft opening for friends and neighbors first, then we flip the apps on for the wider delivery zone.",
      "Thank you for following along. If you made it to the bottom of this post, you are exactly the kind of customer we built this for. See you soon.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

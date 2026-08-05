// Flagship Gorgias customer stories (curated ~25), grounded in public gorgias.com/customers case studies.
// Richer than proofpoints.js: each has the headline metric, a short challenge->result story, a real quote,
// the vertical (aligned to the panel's vertical dropdown keys), segment, the helpdesk they switched from,
// and products in use, so the copilot can match a live prospect by vertical AND by competitor-being-switched-from.
// Re-run "resync stories" to refresh. Source: https://www.gorgias.com/customers
window.CUSTOMER_STORIES = [
  {
    brand: "Arc'teryx", vertical: "fashion_apparel", segment: "Enterprise", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "75% higher conversion rate (4% to 7%) and 23x ROI on AI Agent",
    story: "Premium outdoor brand with a high-consideration, research-heavy purchase. Shopping Assistant answers pre-sale product questions in the moment, lifting on-site conversion without adding headcount.",
    quote: "Because of the premium price point, people tend to do more research and ask more questions before purchasing.",
    quoteBy: "Arc'teryx CX team",
    url: "https://www.gorgias.com/customers/arcteryx"
  },
  {
    brand: "Tommy John", vertical: "fashion_apparel", segment: "Enterprise", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "Help Center"],
    metric: "$106K in sales in two months; agents prefer Gorgias over Zendesk",
    story: "Apparel brand tying CX to revenue. Moved off Zendesk to a Shopify-native setup where support drives and tracks sales, and rewards agents for conversions.",
    quote: "Gorgias will help us achieve our goal of making selling and CX much more integrated.",
    quoteBy: "Tommy John",
    url: "https://www.gorgias.com/customers/tommy-john"
  },
  {
    brand: "Pepper", vertical: "fashion_apparel", segment: "Commercial", prevHelpdesk: "Gladly",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "Automates 54% of support and converts 19% of conversations",
    story: "Intimates brand facing a holiday support spike. AI Agent absorbed the volume and turned conversations into sales, avoiding a costly BPO expansion.",
    quote: "We would have had to expand our BPO contract by at least $25K for the holiday season, and likely more as our brand grows.",
    quoteBy: "Pepper",
    url: "https://www.gorgias.com/customers/pepper"
  },
  {
    brand: "Psycho Bunny", vertical: "fashion_apparel", segment: "Enterprise", prevHelpdesk: "Zendesk",
    products: ["AI Agent"],
    metric: "Doubled revenue without adding headcount; 10% lower total cost of ownership",
    story: "Outgrew Zendesk as a legacy tool. Switched to a Shopify-native, easier-to-manage platform and scaled revenue without growing the team.",
    quote: "Zendesk was a legacy tool. As we grew, we needed something better suited for Shopify and easier to manage.",
    quoteBy: "Psycho Bunny",
    url: "https://www.gorgias.com/customers/psycho-bunny-cost-savings"
  },
  {
    brand: "SuitShop", vertical: "fashion_apparel", segment: "Enterprise", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "SMS"],
    metric: "$175K revenue generated from showroom employees in Gorgias in one quarter",
    story: "Treats every in-store no-purchase as an abandoned cart, following up through Gorgias. Showroom staff use the inbox to recover and drive sales.",
    quote: "Every time someone comes into our store, we email them a follow-up through Gorgias, especially if they didn't purchase in store.",
    quoteBy: "SuitShop",
    url: "https://www.gorgias.com/customers/suitshop-retail"
  },
  {
    brand: "Delta Galil", vertical: "fashion_apparel", segment: "Enterprise", prevHelpdesk: "legacy tools",
    products: ["AI Agent", "Shopping Assistant", "Gaia"],
    metric: "Runs 5 brands from one inbox; 60% of support automated",
    story: "Global apparel group (Bare Necessities, Splendid, PJ Salvage and more) consolidated onto one Gorgias inbox. Gaia audited the knowledge base to find gaps and duplicates.",
    quote: "The beauty of Gorgias and Shopify is that it's plug and play. It took us 10-15 minutes to set up each store.",
    quoteBy: "Nicole Parker, Senior Manager of Customer Service",
    url: "https://www.gorgias.com/customers/delta-galil"
  },
  {
    brand: "ALOHAS", vertical: "fashion_apparel", segment: "Commercial", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "Live Chat", "Flows"],
    metric: "83% automation and double the revenue with quick, on-brand answers",
    story: "On-demand fashion model drives lots of pre-sale questions about drops, discounts and wait times. AI Agent handles them instantly across chat and social.",
    quote: "Our customers often reach out on chat or social with questions on the on-demand collection, the discount, or the wait time.",
    quoteBy: "ALOHAS",
    url: "https://www.gorgias.com/customers/alohas"
  },
  {
    brand: "Shinesty", vertical: "fashion_apparel", segment: "Commercial", prevHelpdesk: "scaling team",
    products: ["AI Agent", "Flows"],
    metric: "Automates 60% of tickets to scale CX with a team of 5",
    story: "Known for personality-driven CX. Automated the repetitive 60% so a small team keeps its signature 1:1 voice as volume grows.",
    quote: "We get a lot of praise for our CX team after 1:1 interactions. We can't lose that as we scale.",
    quoteBy: "Shinesty",
    url: "https://www.gorgias.com/customers/shinesty-automate"
  },
  {
    brand: "Boody", vertical: "fashion_apparel", segment: "Commercial", prevHelpdesk: "Re:amaze",
    products: ["AI Agent"],
    metric: "Cut response times sharply with AI Agent; freed agents for high-value work",
    story: "Sustainable basics brand where agents were stuck on repetitive tickets. AI Agent took the routine volume so the team could create memorable experiences.",
    quote: "Team morale was lower than it could have been because agents felt like they were constantly responding to tickets.",
    quoteBy: "Boody",
    url: "https://www.gorgias.com/customers/boody"
  },
  {
    brand: "Cabau Lifestyle", vertical: "fashion_apparel", segment: "Commercial", prevHelpdesk: "",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "Maintained a 50% repeat customer rate during Netflix-driven hypergrowth",
    story: "A viral moment brought a wave of new shoppers asking product questions. AI Agent and Shopping Assistant handled the surge and protected retention.",
    quote: "We attracted a lot of new customers, which raised questions like 'What are the ingredients?' or 'Which products can I use together?'",
    quoteBy: "Cabau Lifestyle",
    url: "https://www.gorgias.com/customers/cabau-lifestyle"
  },
  {
    brand: "Kulani Kinis", vertical: "fashion_apparel", segment: "Commercial", prevHelpdesk: "",
    products: ["Helpdesk", "Loop integration"],
    metric: "$400K in refunds handled efficiently using Gorgias + Loop",
    story: "Swimwear brand with heavy exchange and sizing questions. Gorgias plus the Loop returns integration lets agents resolve exchanges in one place.",
    quote: "I love the fit but not the color. If I exchanged for a new color, would it arrive before I go on vacation?",
    quoteBy: "Kulani Kinis customer example",
    url: "https://www.gorgias.com/customers/kulani-kinis"
  },
  {
    brand: "bareMinerals", vertical: "beauty_cosmetics", segment: "Commercial", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "0 returns from AI-influenced sales thanks to smarter recommendations",
    story: "Shade-matching is the hardest part of buying makeup online. Shopping Assistant makes accurate recommendations so AI-influenced purchases don't come back.",
    quote: "I have neutral undertones and usually wear medium beige foundations. What shade should I buy?",
    quoteBy: "bareMinerals customer example",
    url: "https://www.gorgias.com/customers/bareminerals"
  },
  {
    brand: "Dr. Bronner's", vertical: "beauty_cosmetics", segment: "Commercial", prevHelpdesk: "legacy tools",
    products: ["AI Agent"],
    metric: "Saved $100K per year by automating 45% of interactions",
    story: "Made their tooling work for them, jumping in on automation early. Within the first 30 days they automated 30% and kept climbing.",
    quote: "Gorgias was a huge opportunity and we decided to jump in head first. Within the first 30 days, we automated 30%.",
    quoteBy: "Dr. Bronner's",
    url: "https://www.gorgias.com/customers/dr-bronners"
  },
  {
    brand: "Glamnetic", vertical: "beauty_cosmetics", segment: "Commercial", prevHelpdesk: "",
    products: ["Convert"],
    metric: "18.39% on-ticket conversion rate; 49% more sales",
    story: "Uses Convert to segment on-site campaigns and target shoppers who are about to leave or eyeing a product, turning support touchpoints into sales.",
    quote: "With Gorgias Convert, we can segment on-site campaigns and specifically target customers thinking about leaving the site.",
    quoteBy: "Glamnetic",
    url: "https://www.gorgias.com/customers/glamnetic"
  },
  {
    brand: "Osea Malibu", vertical: "beauty_cosmetics", segment: "Enterprise", prevHelpdesk: "Zendesk",
    products: ["AI Agent"],
    metric: "Automated quality reviews and boosted customer satisfaction",
    story: "Manual ticket QA was eating an hour a week on a tiny sample. AI-assisted review covers far more tickets and lifts CSAT.",
    quote: "I spent over an hour every week randomly selecting tickets to review. It felt like a lot of effort for such a small sample.",
    quoteBy: "Osea Malibu",
    url: "https://www.gorgias.com/customers/osea-malibu"
  },
  {
    brand: "Topicals", vertical: "beauty_cosmetics", segment: "Commercial", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "Flows"],
    metric: "AI Agent guides shoppers pre-purchase, answering FAQs and product fit",
    story: "Mission-driven skincare brand. AI Agent provides guidance before purchase so first-time buyers get the right products with confidence.",
    quote: "Our passion was to change the conversation around chronic skin conditions.",
    quoteBy: "Olamide Olowe, Founder",
    url: "https://www.gorgias.com/customers/topicals"
  },
  {
    brand: "OLIPOP", vertical: "food_beverage", segment: "Commercial", prevHelpdesk: "Front",
    products: ["SMS", "Helpdesk"],
    metric: "88% faster first response, 91% faster resolution, 25x ROI",
    story: "Fast-growing soda brand needed omnichannel support in one place. Consolidating on Gorgias slashed response and resolution times.",
    quote: "We wanted customers to reach us on any platform and answer it all in one place, while seeing where they are in their journey.",
    quoteBy: "OLIPOP",
    url: "https://www.gorgias.com/customers/olipop"
  },
  {
    brand: "Everyday Dose", vertical: "food_beverage", segment: "Commercial", prevHelpdesk: "",
    products: ["Helpdesk", "Recharge integration"],
    metric: "60% faster first-response time and 45% quicker resolution",
    story: "Functional coffee brand with subscription volume. Deep Recharge integration gives agents everything in one interface and cuts error rates.",
    quote: "Our error rate has reduced drastically. Our care team can access everything they need from a single interface.",
    quoteBy: "Everyday Dose",
    url: "https://www.gorgias.com/customers/everyday-dose"
  },
  {
    brand: "Obvi", vertical: "supplements", segment: "Commercial", prevHelpdesk: "Gmail",
    products: ["AI Agent", "Flows"],
    metric: "50% automation rate; 10x revenue from support during peak",
    story: "Moved off Gmail as support volume grew. AI Agent handles repetitive questions so the CX team drives revenue instead of clearing an inbox.",
    quote: "The Helpdesk made us more efficient, but the team was still spending most of its time on repetitive questions.",
    quoteBy: "Obvi",
    url: "https://www.gorgias.com/customers/obvi"
  },
  {
    brand: "Loop Earplugs", vertical: "health_wellness", segment: "Commercial", prevHelpdesk: "",
    products: ["AI Agent"],
    metric: "56% automation rate in under two months",
    story: "High-growth consumer health brand set an aggressive automation goal and blew past it, still climbing above 50%.",
    quote: "Our goal was 30% automation in 30 days. We surpassed that and are now above 50%, and still climbing.",
    quoteBy: "Loop Earplugs",
    url: "https://www.gorgias.com/customers/loop-earplugs"
  },
  {
    brand: "Orthofeet", vertical: "health_wellness", segment: "Enterprise", prevHelpdesk: "Freshdesk",
    products: ["AI Agent", "Help Center", "SMS"],
    metric: "Automated 56% of tickets in under two months",
    story: "Largest US orthopedic footwear provider. An outsourced team lacked platform access; bringing support in-house on Gorgias with AI Agent hit and passed their automation targets.",
    quote: "Our outsourced team didn't have access to all our platforms, which limited the support they could provide.",
    quoteBy: "Courtney Bajek, Customer Service Lead",
    url: "https://www.gorgias.com/customers/orthofeet"
  },
  {
    brand: "The Diamond Store", vertical: "jewelry_accessories", segment: "Enterprise", prevHelpdesk: "Outlook",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "£885K GMV influenced by Shopping Assistant in 90 days; 32% higher AOV",
    story: "High-emotion, high-consideration jewelry purchases. Shopping Assistant guides gift buyers and lifts order value, turning live chat into a real sales channel.",
    quote: "Our customers are shopping for really happy moments, but there's a lot of pressure to get the perfect gift right.",
    quoteBy: "Chelsey Taylor, Head of Sales and Customer Service",
    url: "https://www.gorgias.com/customers/the-diamond-store"
  },
  {
    brand: "Caitlyn Minimalist", vertical: "jewelry_accessories", segment: "Commercial", prevHelpdesk: "",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "11.3% uplift in average order value from Shopping Assistant",
    story: "Personalized jewelry brand. Shopping Assistant gives tailored product guidance that feels like an extension of the team and raises AOV.",
    quote: "Shopping Assistant has become an intuitive extension of our team, offering guidance that feels personal and intentional.",
    quoteBy: "Caitlyn Minimalist",
    url: "https://www.gorgias.com/customers/caitlyn-minimalist-shopping-assistant"
  },
  {
    brand: "Tushy", vertical: "home_garden", segment: "Commercial", prevHelpdesk: "Zendesk",
    products: ["AI Agent", "Shopping Assistant"],
    metric: "15% chat conversion rate, 2x higher than before",
    story: "Bath brand educating first-time buyers. Shopping Assistant offers honest, helpful advice without a hard sell, doubling chat conversion.",
    quote: "They can offer honest, helpful advice without the pressure of pushing a sale or awkward closing lines.",
    quoteBy: "Tushy",
    url: "https://www.gorgias.com/customers/tushy-shopping-assistant"
  },
  {
    brand: "BrüMate", vertical: "home_garden", segment: "Commercial", prevHelpdesk: "Zendesk",
    products: ["Helpdesk", "Live Chat", "Help Center"],
    metric: "More than $9 million in revenue from their support team",
    story: "Drinkware brand that treats support as a revenue center. Switched off Zendesk and turned CX into a multi-million-dollar channel, with a real voice in the product roadmap.",
    quote: "The ability to have influence and be part of product development made it an easy decision to put Gorgias as our number one platform.",
    quoteBy: "BrüMate",
    url: "https://www.gorgias.com/customers/brumate"
  },
  {
    brand: "Timbuk2", vertical: "general", segment: "Commercial", prevHelpdesk: "Zendesk",
    products: ["Helpdesk", "SMS", "Live Chat"],
    metric: "96% faster responses and 35% more revenue",
    story: "Bag maker whose old Zendesk setup lacked SMS and chat and forced platform-switching. Consolidating on Gorgias sped up responses and grew revenue.",
    quote: "Zendesk didn't support SMS or chat, and the team had to swap between multiple platforms to talk with customers.",
    quoteBy: "Joseph, Timbuk2",
    url: "https://www.gorgias.com/customers/timbuk2"
  },
  {
    brand: "Princess Polly", vertical: "fashion_apparel", segment: "Enterprise", prevHelpdesk: "Zendesk",
    products: ["Helpdesk", "Automation"],
    metric: "80% decrease in resolution time",
    story: "Fast-fashion brand that values agent experience as much as customer experience. Gorgias sped up resolution while strengthening the team's day-to-day.",
    quote: "What matters isn't only the customer experience, but the agent experience and our partnership, and Gorgias responds to all of that.",
    quoteBy: "Princess Polly",
    url: "https://www.gorgias.com/customers/princess-polly"
  }
];

import type { ScriptTemplate, TrendingTopic } from "@/types";

export const TRENDING_CATEGORIES = [
  "All",
  "Money",
  "Fitness",
  "Dating",
  "Tech",
  "Comedy",
  "Motivation",
] as const;

export const CURATED_TRENDING_TOPICS: TrendingTopic[] = [
  { title: "Side hustles that actually work in 2024", category: "Money", description: "Realistic money-making ideas backed by real results", popularity: "hot" },
  { title: "How I made $10K in 30 days", category: "Money", description: "Step-by-step journey to first 5 figures", popularity: "hot" },
  { title: "Passive income nobody talks about", category: "Money", description: "Hidden income streams most people overlook", popularity: "rising" },
  { title: "Financial mistakes in your 20s", category: "Money", description: "Money habits that keep you broke", popularity: "steady" },
  { title: "Dropshipping is dead — here's what works", category: "Money", description: "New business models replacing old trends", popularity: "rising" },
  { title: "5-minute morning workout", category: "Fitness", description: "Quick routine for busy people", popularity: "hot" },
  { title: "What I eat in a day for fat loss", category: "Fitness", description: "Real meals, real macros, real results", popularity: "hot" },
  { title: "Gym mistakes beginners make", category: "Fitness", description: "Common form errors that cause injury", popularity: "steady" },
  { title: "Home workout no equipment", category: "Fitness", description: "Full body workout in your living room", popularity: "rising" },
  { title: "Protein myths debunked", category: "Fitness", description: "Science-backed nutrition facts", popularity: "steady" },
  { title: "Green flags in a relationship", category: "Dating", description: "Signs you found a keeper", popularity: "hot" },
  { title: "Why you keep attracting the wrong people", category: "Dating", description: "Attachment style breakdown", popularity: "rising" },
  { title: "First date ideas that actually work", category: "Dating", description: "Unique dates that create connection", popularity: "steady" },
  { title: "Texting rules nobody tells you", category: "Dating", description: "How to keep someone interested", popularity: "hot" },
  { title: "Signs they're not into you", category: "Dating", description: "Red flags you're ignoring", popularity: "rising" },
  { title: "AI tools that will blow your mind", category: "Tech", description: "Free AI apps you need to try", popularity: "hot" },
  { title: "iPhone settings you should change NOW", category: "Tech", description: "Hidden features most people miss", popularity: "hot" },
  { title: "Apps that pay you real money", category: "Tech", description: "Legit apps with actual payouts", popularity: "rising" },
  { title: "ChatGPT prompts that make money", category: "Tech", description: "Using AI to build income streams", popularity: "hot" },
  { title: "Websites that feel illegal to know", category: "Tech", description: "Free tools that save hundreds", popularity: "steady" },
  { title: "POV: your inner monologue", category: "Comedy", description: "Relatable overthinking moments", popularity: "hot" },
  { title: "Things that only happen to me", category: "Comedy", description: "Uniquely embarrassing moments", popularity: "rising" },
  { title: "Living with a roommate be like", category: "Comedy", description: "Apartment life struggles", popularity: "steady" },
  { title: "Corporate job humor", category: "Comedy", description: "9-5 office culture jokes", popularity: "rising" },
  { title: "When your brain won't shut up", category: "Comedy", description: "Anxiety but make it funny", popularity: "hot" },
  { title: "Discipline beats motivation every time", category: "Motivation", description: "Why waiting for motivation keeps you stuck", popularity: "hot" },
  { title: "1% better every day", category: "Motivation", description: "Compound growth in real life", popularity: "steady" },
  { title: "Your comfort zone is killing you", category: "Motivation", description: "Why growth requires discomfort", popularity: "rising" },
  { title: "What successful people do at 5AM", category: "Motivation", description: "Morning routines of high achievers", popularity: "hot" },
  { title: "Stop making excuses — start now", category: "Motivation", description: "The truth about procrastination", popularity: "rising" },
];

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: "day-in-life",
    name: "Day in My Life",
    emoji: "📅",
    description: "Walk viewers through your daily routine with a specific angle",
    category: "Lifestyle",
    structure: `[HOOK: Start with the most interesting part of your day]
[MORNING: Quick morning routine montage]
[MAIN EVENT: The core activity or work you do]
[EVENING: Wind down and reflection]
[CTA: Ask viewers about their daily routine]`,
  },
  {
    id: "three-things",
    name: "3 Things You Didn't Know",
    emoji: "🤯",
    description: "Share surprising facts or tips that shock viewers",
    category: "Educational",
    structure: `[HOOK: "I bet you didn't know these 3 things about {topic}"]
[THING 1: Most surprising fact - deliver fast]
[THING 2: Build on the first, escalate]
[THING 3: The mind-blowing one - save the best for last]
[CTA: "Which one surprised you the most? Comment below"]`,
  },
  {
    id: "pov",
    name: "POV: Scenario",
    emoji: "👁️",
    description: "Put the viewer in a relatable or dramatic scenario",
    category: "Entertainment",
    structure: `[HOOK: "POV: {relatable scenario}"]
[SETUP: Set the scene quickly - 2 seconds max]
[BUILD: Escalate the situation with tension or humor]
[PUNCHLINE: The payoff that makes them rewatch]
[CTA: "Tag someone who does this"]`,
  },
  {
    id: "story-time",
    name: "Story Time",
    emoji: "📖",
    description: "Tell a captivating personal story with a twist ending",
    category: "Storytelling",
    structure: `[HOOK: Start with the climax - "So there I was..."]
[CONTEXT: Quick backstory - keep it under 5 seconds]
[RISING ACTION: Build tension, add details]
[CLIMAX: The main event - the twist]
[RESOLUTION: What happened after + lesson learned]
[CTA: "Has this ever happened to you?"]`,
  },
  {
    id: "hot-take",
    name: "Controversial Take",
    emoji: "🔥",
    description: "Share a bold opinion that sparks debate in comments",
    category: "Opinion",
    structure: `[HOOK: State the controversial opinion bluntly]
[EVIDENCE: Back it up with 2-3 quick points]
[COUNTER: Address the obvious objection]
[DOUBLE DOWN: Reinforce your take even stronger]
[CTA: "Agree or disagree? Fight in the comments"]`,
  },
];

export const CAPTION_STYLES = [
  { id: "classic", name: "Classic", className: "caption-classic" },
  { id: "bold", name: "Bold", className: "caption-bold" },
  { id: "gradient", name: "Gradient", className: "caption-gradient" },
  { id: "outline", name: "Outline", className: "caption-outline" },
] as const;

export const BEST_POSTING_TIMES = [
  { day: "Mon", slots: [7, 10, 18, 21] },
  { day: "Tue", slots: [9, 12, 17, 20] },
  { day: "Wed", slots: [7, 11, 17, 21] },
  { day: "Thu", slots: [9, 12, 19, 21] },
  { day: "Fri", slots: [5, 11, 15, 19] },
  { day: "Sat", slots: [9, 11, 14, 19] },
  { day: "Sun", slots: [7, 10, 16, 19] },
];

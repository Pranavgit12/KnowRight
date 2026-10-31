import {
  BriefcaseBusiness,
  Building2,
  Landmark,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";

export interface Topic {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  prompt: string;
  sourceIds: string[];
  Icon: LucideIcon;
}

export const topics: Topic[] = [
  {
    slug: "housing",
    title: "Housing",
    shortDescription: "Renting, repairs, and feeling at home.",
    description:
      "Questions about homes and renting can depend on local rules. The current demo collection does not include housing sources, so it cannot look up relevant passages for this topic.",
    prompt: "What should I know about renting a home?",
    sourceIds: [],
    Icon: Building2,
  },
  {
    slug: "work",
    title: "Work",
    shortDescription: "Pay, hours, and workplace questions.",
    description:
      "Workplace rules depend on where you work and the details of a situation. There are no work-related source records in this demo collection.",
    prompt: "What rights should I know about at work?",
    sourceIds: [],
    Icon: BriefcaseBusiness,
  },
  {
    slug: "government-services",
    title: "Government services",
    shortDescription: "Finding information and public services.",
    description:
      "The demo includes selected central-law passages about requests for government information. This is a narrow starting point, not comprehensive guidance about public services.",
    prompt:
      "What does the source say about asking a public office for information?",
    sourceIds: [
      "india-rti-request-s6",
      "india-rti-response-s7",
      "india-rti-exemptions-s8",
    ],
    Icon: Landmark,
  },
  {
    slug: "consumer-issues",
    title: "Consumer issues",
    shortDescription: "Questions about goods, services, and complaints.",
    description:
      "The demo includes selected summaries from India's central Consumer Protection Act. These summaries are limited and do not establish how the law applies to a particular situation.",
    prompt:
      "What do these sources say about making a consumer complaint?",
    sourceIds: [
      "india-consumer-definition-s2",
      "india-consumer-complaint-s35",
      "india-consumer-response-s38",
      "india-consumer-limitation-s69",
    ],
    Icon: ShoppingBag,
  },
  {
    slug: "small-business",
    title: "Small business",
    shortDescription: "The rules behind doing business.",
    description:
      "Business obligations vary by location and activity. This demo does not include small-business sources, so it cannot provide a source lookup for this topic.",
    prompt: "What should I know before starting a small business?",
    sourceIds: [],
    Icon: Store,
  },
];

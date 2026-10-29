// ConversationSource fixtures — the customer emails behind each AI
// suggestion, shown in the review view's Sources sheet.
//
// Every source belongs to exactly one suggestion (`suggestionId`), and
// each suggestion's `sourceCount` in `./suggestions.ts` equals the number
// of sources listed here for it (the seed integrity check enforces it).
// Subjects and snippets match the change the suggestion makes. Times are
// relative to app load and land after the article's last update, so the
// evidence always reads as recent.

import type { ConversationSource } from '../types';

const DAY_MS = 86_400_000;

/** ISO timestamp `n` days before app load, at `hour:minute` UTC. */
function daysAgo(n: number, hour: number, minute: number): string {
  const d = new Date(Date.now() - n * DAY_MS);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

type SourceInput = Omit<ConversationSource, 'articleId' | 'suggestionId'>;

function forSuggestion(articleId: string, suggestionId: string, list: SourceInput[]): ConversationSource[] {
  return list.map((source) => ({ ...source, articleId, suggestionId }));
}

const RESET_PW = 'art-how-to-reset-your-password';
const AUTO_REPLY = 'art-setting-up-auto-reply-rules';
const CHAT_WIDGET = 'art-customizing-the-chat-widget';
const CHAT_ROUTING = 'art-setting-up-chat-routing';
const ASSIGN = 'art-routing-conversations-with-assignment-rules';
const CHAT_HOURS = 'art-setting-chat-availability-hours';

export const conversationSources: ConversationSource[] = [
  /* ───────── sug-resetpw-1 · mobile app reset steps (7) ───────── */
  ...forSuggestion(RESET_PW, 'sug-resetpw-1', [
    {
      id: 'cs-resetpw-1',
      sender: { name: 'Marcus Reilly', email: 'marcus.reilly@northridge.io' },
      timestamp: daysAgo(1, 9, 14),
      subject: 'How do I reset my password on the iPhone app?',
      snippet:
        'The article only covers the web app. I’m on the road with just my phone and can’t find where to reset my password in the Hiver app.',
    },
    {
      id: 'cs-resetpw-2',
      sender: { name: 'Priya Subramaniam', email: 'priya.s@brightlane.co' },
      timestamp: daysAgo(3, 16, 30),
      subject: 'No “Forgot password” in the Android app?',
      snippet:
        'I logged out of the Android app and now I’m stuck on the sign-in screen. Is the forgot password link hidden somewhere, or do I have to use a computer?',
    },
    {
      id: 'cs-resetpw-3',
      sender: { name: 'Daniel Okafor', email: 'daniel@waypoint-supply.com' },
      timestamp: daysAgo(5, 10, 5),
      subject: 'Reset link opens the browser, not the app',
      snippet:
        'Tapped the reset link on my phone and it opened Safari instead of the Hiver app. After I set the new password, the app still wouldn’t accept it until I restarted it.',
    },
    {
      id: 'cs-resetpw-4',
      sender: { name: 'Yuki Tanaka', email: 'yuki.tanaka@meridian-labs.com' },
      timestamp: daysAgo(8, 11, 45),
      subject: 'Password reset steps for the mobile app',
      snippet:
        'Half of our field team only uses the mobile app. Can you send step-by-step instructions for resetting a password from the app that I can forward to them?',
    },
    {
      id: 'cs-resetpw-5',
      sender: { name: 'Elena Vargas', email: 'elena.vargas@sunpath.org' },
      timestamp: daysAgo(12, 14, 20),
      subject: 'Locked out of the Hiver app after changing phones',
      snippet:
        'New phone, fresh install of the app, and I don’t remember my password. Your help article doesn’t say whether I can reset it from inside the app.',
    },
    {
      id: 'cs-resetpw-6',
      sender: { name: 'Tom Becker', email: 'tbecker@redwoodlogistics.com' },
      timestamp: daysAgo(17, 8, 52),
      subject: 'Where is the reset option in the mobile app?',
      snippet:
        'Looked through the app’s settings twice. I only found it after spotting a tiny “Forgot password” link under the login button.',
    },
    {
      id: 'cs-resetpw-7',
      sender: { name: 'Aisha Rahman', email: 'aisha@clearwater-health.com' },
      timestamp: daysAgo(24, 15, 10),
      subject: 'Mobile password reset not documented',
      snippet:
        'Your article on resetting passwords doesn’t mention the mobile app at all. Our agents keep opening tickets with IT because they assume it isn’t possible.',
    },
  ]),

  /* ───────── sug-resetpw-2 · outdated admin panel URL (5) ───────── */
  ...forSuggestion(RESET_PW, 'sug-resetpw-2', [
    {
      id: 'cs-resetpw-8',
      sender: { name: 'Rachel Kim', email: 'rachel.kim@lumenworks.com' },
      timestamp: daysAgo(2, 13, 40),
      subject: 'Admin panel link in the article is a 404',
      snippet:
        'I’m trying to reset a teammate’s password and admin.hiver.com/legacy/users goes to a “page not found” screen. Where did the users page move?',
    },
    {
      id: 'cs-resetpw-9',
      sender: { name: 'Carlos Mendes', email: 'carlos@brightpath.io' },
      timestamp: daysAgo(6, 9, 3),
      subject: 'Can’t find the users page to reset passwords',
      snippet:
        'The help article sends me to /legacy/users, which just redirects to the dashboard. I need to reset passwords for two new hires today.',
    },
    {
      id: 'cs-resetpw-10',
      sender: { name: 'Hannah Lee', email: 'hannah.lee@greenfield.edu' },
      timestamp: daysAgo(10, 17, 25),
      subject: 'Broken link in “How to reset your password”',
      snippet:
        'Just a heads-up that the admin panel link in your password reset article is broken. The current page seems to be under Settings → Users.',
    },
    {
      id: 'cs-resetpw-11',
      sender: { name: 'Owen Price', email: 'owen.price@harborline.com' },
      timestamp: daysAgo(15, 12, 0),
      subject: 'Old admin URL still in your help article',
      snippet:
        'Our admins bookmarked the URL from your article and it stopped working after your last update. Can you confirm the right address for managing users?',
    },
    {
      id: 'cs-resetpw-12',
      sender: { name: 'Grace Whitman', email: 'gwhitman@pinecrest.com' },
      timestamp: daysAgo(21, 10, 35),
      subject: 'Users page moved?',
      snippet:
        'Followed your article to reset an agent’s password, but the link doesn’t load. Searching the admin panel for the user’s name eventually got me there.',
    },
  ]),

  /* ───────── sug-resetpw-3 · retired Chrome extension steps (2) ───────── */
  ...forSuggestion(RESET_PW, 'sug-resetpw-3', [
    {
      id: 'cs-resetpw-13',
      sender: { name: 'Noah Fischer', email: 'noah@quarrystone.com' },
      timestamp: daysAgo(4, 11, 18),
      subject: 'Chrome extension reset steps don’t match',
      snippet:
        'Your article says to reset from the Chrome extension, but the extension no longer has a password option. Clearing my cache didn’t change anything.',
    },
    {
      id: 'cs-resetpw-14',
      sender: { name: 'Maya Patel', email: 'maya.patel@oakline.co' },
      timestamp: daysAgo(19, 14, 50),
      subject: 'Is the Chrome extension still supported?',
      snippet:
        'I spent 20 minutes on the Chrome extension troubleshooting steps before your support team told me the extension is retired. Please update the article.',
    },
  ]),

  /* ───────── sug-autoreply-1 · timezone note for schedules (4) ───────── */
  ...forSuggestion(AUTO_REPLY, 'sug-autoreply-1', [
    {
      id: 'cs-autoreply-1',
      sender: { name: 'Rebecca Holm', email: 'rebecca@cobaltforge.com' },
      timestamp: daysAgo(2, 8, 22),
      subject: 'Weekend auto-reply starts at the wrong time',
      snippet:
        'Customers on the West Coast get our weekday reply on Saturday mornings, even though Saturday and Sunday are checked in the schedule.',
    },
    {
      id: 'cs-autoreply-2',
      sender: { name: 'James Whitfield', email: 'jwhitfield@pinegrove.studio' },
      timestamp: daysAgo(5, 13, 50),
      subject: 'Rule schedule using the wrong timezone',
      snippet:
        'Our support team is in Denver, but the auto-reply schedule runs on the company timezone in New York. Replies go out two hours early every morning.',
    },
    {
      id: 'cs-autoreply-3',
      sender: { name: 'Laura Chen', email: 'laura.chen@meadowbrook.io' },
      timestamp: daysAgo(9, 16, 12),
      subject: 'Which timezone do auto-reply schedules use?',
      snippet:
        'I set business hours to 9 to 5 thinking it would follow my local time. Is the schedule based on my profile’s timezone or the company’s?',
    },
    {
      id: 'cs-autoreply-4',
      sender: { name: 'Brian Murphy', email: 'brian@tallgrass-ag.com' },
      timestamp: daysAgo(14, 10, 40),
      subject: 'After-hours reply sent during business hours',
      snippet:
        'Our after-hours rule fired at 3 PM for a customer in Chicago. We only have one timezone set for the company, so I’m not sure what we got wrong.',
    },
  ]),

  /* ───────── sug-autoreply-2 · the “Recent” trigger (3) ───────── */
  ...forSuggestion(AUTO_REPLY, 'sug-autoreply-2', [
    {
      id: 'cs-autoreply-5',
      sender: { name: 'Hannah Castelli', email: 'hannah.c@silvercrest-co.com' },
      timestamp: daysAgo(3, 15, 10),
      subject: '“Recent” trigger fires on old threads',
      snippet:
        'I picked the Recent trigger for our after-hours auto-reply. It sends a reply on conversations from three months ago every time the customer writes back.',
    },
    {
      id: 'cs-autoreply-6',
      sender: { name: 'Derek Olsen', email: 'derek.olsen@bluepeak.com' },
      timestamp: daysAgo(7, 9, 27),
      subject: 'What does “Recent” mean for auto-reply rules?',
      snippet:
        'Does the Recent trigger mean the last hour, the last day, or anything since the conversation was created? The rule editor doesn’t say.',
    },
    {
      id: 'cs-autoreply-7',
      sender: { name: 'Sophie Turner', email: 'sophie@lanternhouse.co' },
      timestamp: daysAgo(12, 12, 44),
      subject: 'Customers getting the same auto-reply twice',
      snippet:
        'A customer wrote in on Monday and again on Tuesday and got our auto-reply both times. We use the Recent trigger. Is there a time window we should add?',
    },
  ]),

  /* ───────── sug-autoreply-3 · retired sender domain toggle (1) ───────── */
  ...forSuggestion(AUTO_REPLY, 'sug-autoreply-3', [
    {
      id: 'cs-autoreply-8',
      sender: { name: 'Thiago Almeida', email: 'thiago@levelten-ops.io' },
      timestamp: daysAgo(6, 9, 33),
      subject: 'Sender domain toggle missing from the rule editor',
      snippet:
        'Your article mentions a “Match by sender domain only” toggle, but I can’t find it in the rule editor. We need to filter by domain for one enterprise customer.',
    },
  ]),

  /* ───────── sug-chatwidget-1 · accessibility guidance (2) ───────── */
  ...forSuggestion(CHAT_WIDGET, 'sug-chatwidget-1', [
    {
      id: 'cs-chatwidget-1',
      sender: { name: 'Kwame Asante', email: 'kwame@oakridge-health.com' },
      timestamp: daysAgo(4, 10, 47),
      subject: 'Need WCAG AA contrast on the chat launcher',
      snippet:
        'Our compliance team flagged the chat launcher contrast as below 4.5:1 against our header. We need to meet WCAG 2.1 AA. How can we check this in the widget editor?',
    },
    {
      id: 'cs-chatwidget-2',
      sender: { name: 'Megan Doyle', email: 'megan.doyle@lakeside-insurance.com' },
      timestamp: daysAgo(16, 14, 5),
      subject: 'Screen reader skips our welcome banner',
      snippet:
        'One of our customers uses a screen reader and says the chat widget’s welcome banner is never read aloud. Our banner is just a wave emoji. Is that the problem?',
    },
  ]),

  /* ───────── sug-chatwidget-2 · color picker → theme selector (2) ───────── */
  ...forSuggestion(CHAT_WIDGET, 'sug-chatwidget-2', [
    {
      id: 'cs-chatwidget-3',
      sender: { name: 'Sofia Marchetti', email: 'sofia@archway-press.com' },
      timestamp: daysAgo(8, 16, 5),
      subject: 'Can’t find the color picker in the widget editor',
      snippet:
        'Your article says to use the Color picker, but all I see under Widget → Appearance is a “Theme selector.” Is that the same thing?',
    },
    {
      id: 'cs-chatwidget-4',
      sender: { name: 'Ryan Brooks', email: 'ryan@summitgear.com' },
      timestamp: daysAgo(13, 11, 30),
      subject: 'Warning badge when choosing widget colors',
      snippet:
        'When I pick our brand orange, a contrast warning shows up next to the theme. The help article doesn’t mention it. Should I pick a different color?',
    },
  ]),

  /* ───────── sug-chatwidget-3 · legacy iframe embed (1) ───────── */
  ...forSuggestion(CHAT_WIDGET, 'sug-chatwidget-3', [
    {
      id: 'cs-chatwidget-5',
      sender: { name: 'Ahmed Bouzidi', email: 'ahmed.b@vantage-cloud.io' },
      timestamp: daysAgo(11, 12, 28),
      subject: 'Iframe embed missing typing indicator',
      snippet:
        'We followed the iframe steps in your article for our locked-down CMS. Customers don’t see the agent typing indicator, and now we hear iframe embeds are going away.',
    },
  ]),

  /* ───────── sug-chatrouting-1 · default routing method (1) ───────── */
  ...forSuggestion(CHAT_ROUTING, 'sug-chatrouting-1', [
    {
      id: 'cs-chatrouting-1',
      sender: { name: 'Jordan Ellis', email: 'jordan.ellis@fieldstone.co' },
      timestamp: daysAgo(5, 15, 42),
      subject: 'Chats aren’t going to the first agent who answers',
      snippet:
        'Your article says new chats go to whoever accepts first, but ours rotate between agents. Did the default change? Our team expected the old behavior.',
    },
  ]),

  /* ───────── Incoming batch (see suggestions.ts) ───────── */

  /* sug-assign-1 · unmatched conversations (2) */
  ...forSuggestion(ASSIGN, 'sug-assign-1', [
    {
      id: 'cs-assign-1',
      sender: { name: 'Priya Natarajan', email: 'priya@bluefinch.co' },
      timestamp: daysAgo(1, 8, 20),
      subject: 'Where do conversations go if no rule matches?',
      snippet: 'We set up three assignment rules, but a few emails never got assigned to anyone. Are they lost, or is there somewhere we should look?',
    },
    {
      id: 'cs-assign-2',
      sender: { name: 'Tom Becker', email: 'tom.becker@harborline.com' },
      timestamp: daysAgo(1, 13, 5),
      subject: 'Unassigned emails piling up',
      snippet: 'Some conversations sit unassigned in the shared inbox. Is that expected when none of our rules match them?',
    },
  ]),

  /* sug-assign-2 · load-balanced assignment (3) */
  ...forSuggestion(ASSIGN, 'sug-assign-2', [
    {
      id: 'cs-assign-3',
      sender: { name: 'Hannah Ortiz', email: 'hannah@oakandpine.io' },
      timestamp: daysAgo(1, 10, 2),
      subject: 'Round-robin isn’t fair for our team',
      snippet: 'Round-robin gives everyone the same number of emails, but some take an hour and some take a minute. Can we assign by workload instead?',
    },
    {
      id: 'cs-assign-4',
      sender: { name: 'Leo Fischer', email: 'leo.fischer@kranich.de' },
      timestamp: daysAgo(1, 9, 41),
      subject: 'Assign to whoever has the fewest open conversations?',
      snippet: 'Is there a way to send new conversations to the person with the lightest load right now?',
    },
    {
      id: 'cs-assign-5',
      sender: { name: 'Ama Owusu', email: 'ama.owusu@greenleaf.org' },
      timestamp: daysAgo(2, 16, 30),
      subject: 'Balancing workload across agents',
      snippet: 'Two of our agents always end up with the long threads. Does Hiver have a load-balanced option?',
    },
  ]),

  /* sug-assign-3 · retired classic view (2) */
  ...forSuggestion(ASSIGN, 'sug-assign-3', [
    {
      id: 'cs-assign-6',
      sender: { name: 'Grace Liu', email: 'grace.liu@northpeak.io' },
      timestamp: daysAgo(1, 15, 26),
      subject: 'Can’t find Settings → Classic view',
      snippet: 'Your assignment rules article says we can switch to the classic view, but that option isn’t in Settings anymore.',
    },
    {
      id: 'cs-assign-7',
      sender: { name: 'Omar Haddad', email: 'omar@sandline.ae' },
      timestamp: daysAgo(2, 10, 48),
      subject: 'Classic assignment screen gone?',
      snippet: 'We used to switch back to the classic screen. Was it removed? The help article still mentions it.',
    },
  ]),

  /* sug-chathours-1 · time zone (2) */
  ...forSuggestion(CHAT_HOURS, 'sug-chathours-1', [
    {
      id: 'cs-chathours-1',
      sender: { name: 'Sofia Marquez', email: 'sofia@lumacycles.com' },
      timestamp: daysAgo(1, 7, 55),
      subject: 'Chat says we’re offline during business hours',
      snippet: 'Customers in Madrid see our chat as offline at 10am. Are the hours based on their time zone or ours?',
    },
    {
      id: 'cs-chathours-2',
      sender: { name: 'Raj Mehta', email: 'raj.mehta@tidewater.in' },
      timestamp: daysAgo(1, 11, 18),
      subject: 'Which time zone do availability hours use?',
      snippet: 'We set 9 to 6 but the widget turns off at 3:30. I think it’s using a different time zone.',
    },
  ]),

  /* sug-chathours-2 · holiday calendar (4) */
  ...forSuggestion(CHAT_HOURS, 'sug-chathours-2', [
    {
      id: 'cs-chathours-3',
      sender: { name: 'Emily Clarke', email: 'emily.clarke@brightdesk.co.uk' },
      timestamp: daysAgo(1, 9, 12),
      subject: 'Do we really have to turn chat off by hand on holidays?',
      snippet: 'Your article says to switch availability off for each holiday. Is there no holiday calendar?',
    },
    {
      id: 'cs-chathours-4',
      sender: { name: 'Daniel Kim', email: 'daniel.kim@ridgepoint.com' },
      timestamp: daysAgo(1, 14, 47),
      subject: 'Chat stayed off after the holiday',
      snippet: 'Someone forgot to turn chat back on after the long weekend. Is there a way to schedule holidays?',
    },
    {
      id: 'cs-chathours-5',
      sender: { name: 'Nora Lindqvist', email: 'nora@fjordlabs.se' },
      timestamp: daysAgo(2, 8, 3),
      subject: 'Holiday schedule for chat',
      snippet: 'I found a Holidays tab under Availability. Is that the right way to close chat on public holidays?',
    },
    {
      id: 'cs-chathours-6',
      sender: { name: 'Marco Bianchi', email: 'marco@vialtech.it' },
      timestamp: daysAgo(3, 17, 20),
      subject: 'Setting up public holidays',
      snippet: 'We want chat closed on national holidays without changing our weekly hours every time.',
    },
  ]),
];

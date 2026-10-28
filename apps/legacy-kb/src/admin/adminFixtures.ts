// Content for the Admin Panel replica. "product help center" is the help
// center the rest of this app replicates (its AI suggestions drive the
// nudges); the other rows only fill the lists the way a real account would.

export type HelpCenterVisibility = 'internal' | 'external';

export interface AdminHelpCenter {
  id: string;
  name: string;
  visibility: HelpCenterVisibility;
  /** The line under the name, as the live page words it. */
  meta: string;
}

export const REPLICA_HELP_CENTER_ID = 'hc-product';

export const ADMIN_HELP_CENTERS: AdminHelpCenter[] = [
  { id: REPLICA_HELP_CENTER_ID, name: 'product help center', visibility: 'internal', meta: 'Created on Jul 30, 2026' },
  { id: 'hc-customer', name: 'Customer help center', visibility: 'external', meta: 'Created on Aug 2, 2026' },
  { id: 'hc-billing', name: 'Billing FAQs', visibility: 'internal', meta: 'Created on Aug 19, 2026' },
  { id: 'hc-partner', name: 'Partner onboarding', visibility: 'internal', meta: 'Created on Sep 1, 2026' },
  { id: 'hc-playbook', name: 'Agent playbook', visibility: 'internal', meta: 'Created on Sep 10, 2026' },
];

export type KnowledgeSourceType =
  | 'helpCenter'
  | 'website'
  | 'document'
  | 'snippet'
  | 'notion'
  | 'confluence'
  | 'googleDrive'
  | 's3';

export interface KnowledgeSource {
  id: string;
  type: KnowledgeSourceType;
  name: string;
  /** Second line ("Created by …"); help center rows have none. */
  createdBy?: string;
  pages: string;
  /** A date string, "Not connected", or a failed sync. */
  lastSynced: { kind: 'date' | 'notConnected' | 'failed'; text: string };
  /** Help center rows link to this help center id. */
  helpCenterId?: string;
}

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: 'ks-product',
    type: 'helpCenter',
    name: 'product help center',
    pages: '12 items',
    lastSynced: { kind: 'date', text: '27 Oct, 2026, 06:30 PM' },
    helpCenterId: REPLICA_HELP_CENTER_ID,
  },
  {
    id: 'ks-confluence',
    type: 'confluence',
    name: 'Confluence (support@hiver.space)',
    createdBy: 'Created by support@hiver.space',
    pages: '4 pages',
    lastSynced: { kind: 'failed', text: 'Failed' },
  },
  {
    id: 'ks-billing-pdf',
    type: 'document',
    name: 'Billing_FAQ.pdf',
    createdBy: 'Created by Varun',
    pages: '1 file',
    lastSynced: { kind: 'date', text: '02 Aug, 2026, 12:52 PM' },
  },
  {
    id: 'ks-website',
    type: 'website',
    name: 'hiverhq.com/help',
    createdBy: 'Created by Varun',
    pages: '48 pages',
    lastSynced: { kind: 'date', text: '21 Oct, 2026, 09:14 AM' },
  },
  {
    id: 'ks-customer',
    type: 'helpCenter',
    name: 'Customer help center',
    pages: '1 item',
    lastSynced: { kind: 'notConnected', text: 'Not connected' },
    helpCenterId: 'hc-customer',
  },
  {
    id: 'ks-refunds-pdf',
    type: 'document',
    name: 'Refund_policy.pdf',
    createdBy: 'Created by Varun',
    pages: '1 file',
    lastSynced: { kind: 'date', text: '06 Aug, 2026, 01:02 PM' },
  },
];

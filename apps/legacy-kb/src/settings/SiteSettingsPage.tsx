import { useState, type ReactNode } from 'react';
import { copyIcon, defaultFavicon, domainPreview, infoIconSmall, toggleOff, toggleOn } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { AUTO_MODE_COPY, MANUAL_SETTINGS_COPY } from '../improvements/autoModeCopy';
import { useToast } from '../components/ui/Toast';
import { Tooltip } from '../components/ui/Tooltip';
import { pluralize } from '../lib/format';
import { selectActiveHelpCenter, selectSuggestionArticles } from '../store/selectors';
import { useStore } from '../store/StoreContext';

/*
 * Live `/product/siteSettings`. Layout rules are copied as-is so the
 * browser sizes it the same way: a scroll area of calc(100vh - 162px)
 * (92px header + 70px footer), sections of content-box columns
 * (min-width 442px, max-width 40%, padding 0 40px), a 1px #d6e0eb rule
 * between sections. Field text: label 14/17 500 #09274a, description
 * 13/20 #28476a, inputs 13/28 with a 1px #d1e0f1 border, radius 4px.
 */

const COLUMN = 'box-content min-w-[442px] max-w-[40%] px-[40px] py-0';
const SECTION_TITLE = 'm-0 font-inter text-[16px] leading-[20px] font-medium text-legacy-ink';
const FIELD_LABEL = 'pb-[6px] font-inter text-[14px] leading-[17px] font-medium text-legacy-ink';
const FIELD_HELP = 'font-inter text-[13px] leading-[20px] font-normal text-legacy-body';
const INPUT =
  'box-border h-[42px] w-full rounded-[4px] border border-solid border-legacy-input-border bg-white py-[6px] pr-[50px] pl-[12px] font-inter text-[13px] leading-[28px] text-legacy-ink outline-none focus:border-legacy-blue';
const COUNTER = 'pointer-events-none absolute right-[8px] font-inter text-[12px] leading-[28px] text-legacy-meta';
const LINK_ACTION =
  'cursor-pointer border-0 bg-transparent p-0 font-inter text-[14px] leading-[17px] font-medium tracking-[0.3px] text-legacy-blue';

function Field({ label, help, children }: { label: string; help: string; children: ReactNode }) {
  return (
    <div className="relative flex flex-col pb-[30px]">
      <label className={FIELD_LABEL}>{label}</label>
      <p className={`m-0 pb-[16px] ${FIELD_HELP}`}>{help}</p>
      {children}
    </div>
  );
}

function CountedInput({ value, max, onChange, label }: { value: string; max: number; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative flex flex-col">
      <input aria-label={label} className={INPUT} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      <span className={`${COUNTER} top-[7px]`}>
        {value.length}/{max}
      </span>
    </div>
  );
}

/** Info icon + bubble, like the live General Settings rows (top-left, 270px). */
function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip content={text} placement="top-left" maxWidth={270}>
      <img src={infoIconSmall} alt="" aria-label={text} className="h-[16px] w-[16px]" />
    </Tooltip>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer rounded-[8px] border-0 bg-transparent p-0 outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]"
    >
      <img src={checked ? toggleOn : toggleOff} alt="" className="h-[16px] w-[28px]" />
    </button>
  );
}

/** A General Settings row: label + info icon on the left, a control on the right. */
function SettingRow({ label, info, control }: { label: string; info: string; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="pr-[8px] font-inter text-[14px] leading-[17px] font-medium text-legacy-ink">{label}</span>
        <InfoTip text={info} />
      </div>
      {control}
    </div>
  );
}

const ROW_RULE = 'my-[24px] h-px border-0 border-b border-solid border-legacy-input-border';
const SECTION_RULE = 'ml-[40px] border-0 border-b border-solid border-legacy-divider';

export function SiteSettingsPage() {
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const helpCenter = selectActiveHelpCenter(state);
  const waiting = selectSuggestionArticles(state, 'TO_REVIEW').length;

  const [siteName, setSiteName] = useState(helpCenter.title);
  const [description, setDescription] = useState('Our help center has answers for common questions and doubts you may have');
  const [subdomain, setSubdomain] = useState(helpCenter.subdomain);
  const [contactForm, setContactForm] = useState(false);
  const [autoApply, setAutoApply] = useState(state.aiAutoApply);
  const [saved, setSaved] = useState({ siteName, description, subdomain, contactForm });

  const dirty =
    autoApply !== state.aiAutoApply ||
    siteName !== saved.siteName ||
    description !== saved.description ||
    subdomain !== saved.subdomain ||
    contactForm !== saved.contactForm;

  const save = () => {
    if (autoApply !== state.aiAutoApply) dispatch({ type: 'settings/setAiAutoApply', enabled: autoApply });
    setSaved({ siteName, description, subdomain, contactForm });
    showToast('Your changes have been saved');
  };

  // Switching auto on never touches what's already waiting; say so before Save.
  const keepsBacklog = autoApply && !state.aiAutoApply && waiting > 0;

  return (
    <>
      <div className="flex h-[calc(100vh-162px)] overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col">
          <section className="flex">
            <div className={COLUMN}>
              <h2 className={`mt-[28px] mb-[32px] ${SECTION_TITLE}`}>Your site settings</h2>
              <Field label="Site name" help="This is the name of your site">
                <CountedInput label="Site name" value={siteName} max={50} onChange={setSiteName} />
              </Field>
              <Field label="Site description" help="A description of the site for social media and search engines">
                <div className="relative flex flex-col">
                  <textarea
                    aria-label="Site description"
                    className={`${INPUT} h-[94px] resize-none`}
                    value={description}
                    maxLength={160}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <span className={`${COUNTER} bottom-[6px]`}>{description.length}/160</span>
                </div>
              </Field>
              <Field label="Sub-domain" help="Hiver hosts your help center on a unique subdomain of hiverkb.com">
                <div className="relative flex">
                  <div className="mr-[10px] flex flex-auto rounded-[4px] border border-solid border-legacy-input-border leading-[28px]">
                    <div className="relative flex flex-auto flex-col">
                      <input
                        aria-label="Sub-domain"
                        className="box-border h-[40px] w-full rounded-l-[4px] border-0 bg-white py-[6px] pr-[50px] pl-[12px] font-inter text-[13px] leading-[28px] text-legacy-ink outline-none"
                        value={subdomain}
                        maxLength={60}
                        onChange={(e) => setSubdomain(e.target.value)}
                      />
                      <span className={`${COUNTER} top-[6px]`}>{subdomain.length}/60</span>
                    </div>
                    <input
                      aria-label="Domain"
                      readOnly
                      tabIndex={-1}
                      value=".hiverkb.com"
                      className="box-border h-[40px] w-[115px] rounded-r-[4px] border-0 border-l border-solid border-legacy-input-border bg-white px-[12px] py-[6px] font-inter text-[13px] leading-[28px] text-legacy-ink outline-none"
                    />
                  </div>
                  <Tooltip content="Copy link" placement="top-center">
                    <button
                      type="button"
                      aria-label="Copy link"
                      onClick={() => void navigator.clipboard?.writeText(`https://${subdomain}.hiverkb.com`)}
                      className="box-border h-[42px] w-[48px] cursor-pointer rounded-[4px] border border-solid border-legacy-input-border bg-white bg-center bg-no-repeat outline-none focus-visible:border-legacy-blue"
                      style={{ backgroundImage: `url(${copyIcon})` }}
                    />
                  </Tooltip>
                </div>
              </Field>
              <div className="relative flex flex-col pb-[30px]">
                <div className="flex items-center pb-[6px]">
                  <span className="pr-[8px] font-inter text-[14px] leading-[17px] font-medium text-legacy-ink">Custom domain</span>
                </div>
                <p className={`m-0 ${FIELD_HELP}`}>Optionally connect your help center to your own domain.</p>
                <div className="flex">
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent px-0 pt-[16px] pb-0 font-inter text-[14px] leading-[17px] font-medium text-legacy-blue"
                  >
                    Connect custom domain
                  </button>
                </div>
              </div>
            </div>
            <div className={COLUMN}>
              <div
                className="relative mt-[70px] h-[226px] w-[442px] bg-legacy-blue bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${domainPreview})` }}
              >
                <img src={defaultFavicon} alt="" className="absolute top-[91px] left-[125px] h-[15px] w-[15px]" />
                <span className="absolute top-[91px] left-[145px] h-[16px] w-[95px] overflow-hidden bg-white font-inter text-[13px] font-normal text-ellipsis text-black">
                  {siteName.length > 11 ? `${siteName.slice(0, 11)}..` : siteName}
                </span>
                <span className="absolute top-[120px] left-[200px] h-[25px] w-[196px] overflow-hidden bg-[#f0f3f4] font-inter text-[13px] leading-[24px] font-[450] text-black">
                  {subdomain}.hiverkb.com
                </span>
              </div>
              <p className="mt-[12px] mb-0 text-center font-inter text-[13px] leading-[20px] text-legacy-ink">
                Site name &amp; sub-domain preview
              </p>
            </div>
          </section>
          <div className={SECTION_RULE} />
          <section className="flex">
            <div className={COLUMN}>
              <h2 className={`mt-[32px] mb-[24px] ${SECTION_TITLE}`}>General Settings</h2>
              <SettingRow
                label="Contact form"
                info="Add a contact form on your page for your readers to submit an issue right into your shared mailbox"
                control={<Toggle label="Contact form" checked={contactForm} onChange={setContactForm} />}
              />
              <div className={ROW_RULE} />
              <SettingRow
                label="Code snippets"
                info="Added snippets will run on every page of the help center"
                control={
                  <button type="button" className={LINK_ACTION}>
                    Add snippet
                  </button>
                }
              />
              <div className={ROW_RULE} />
              <div className="pb-[30px]">
                <SettingRow
                  label="Export Articles as CSV"
                  info="Get an overview of all articles within the help center with excerpts included"
                  control={
                    <button type="button" className={LINK_ACTION}>
                      Export
                    </button>
                  }
                />
              </div>
            </div>
          </section>
          <div className={SECTION_RULE} />
          <section className="flex">
            <div className={COLUMN}>
              <h2 className={`mt-[32px] mb-[24px] ${SECTION_TITLE}`}>Hiver AI</h2>
              <div className="pb-[30px]">
                <SettingRow
                  label="Apply suggestions automatically"
                  info="Hiver AI suggests improvements to your articles based on your customer conversations"
                  control={<Toggle label="Apply suggestions automatically" checked={autoApply} onChange={setAutoApply} />}
                />
                <p className={`mt-[8px] mb-0 ${FIELD_HELP}`}>
                  {autoApply ? AUTO_MODE_COPY.settingsOn : MANUAL_SETTINGS_COPY}
                </p>
                {keepsBacklog ? (
                  <p className={`mt-[8px] mb-0 ${FIELD_HELP}`}>
                    The {pluralize(waiting, 'article')} already waiting for review will stay in To review.
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Live footer: absolute at the bottom of the view, 70px, white with a 5px shadow. */}
      <footer className="absolute right-0 bottom-0 left-0 z-[100] flex h-[70px] justify-between bg-white shadow-[0_0_5px_0_rgba(0,0,0,0.25)]">
        <div className="px-[20px] py-[15px]" />
        <div className="px-[20px] py-[15px]">
          <div className="flex items-center gap-[12px]">
            <Button variant="primary" className="w-[145px] px-0" disabled={!dirty} onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}

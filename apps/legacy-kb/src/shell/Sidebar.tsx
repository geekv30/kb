import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { lockIcon, plusIcon, sidebarLogo } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { TooltipIconButton } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import { useStore } from '../store/StoreContext';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { selectActiveHelpCenter, selectCategories, selectSuggestionArticles } from '../store/selectors';
import { CategoryNavItem } from './CategoryNavItem';
import { HelpCenterPicker } from './HelpCenterPicker';
import { NewCategoryModal, type NewCategoryValues } from './NewCategoryModal';
import { SuggestionsNavItem } from './SuggestionsNavItem';

/*
 * Live sidebar (chunk 616 `_`/`H`/`R`, chunk 270 `b`/`A`/`j`):
 * nav 243px, #f8f8f8, full height. Logo box 41px tall at margin
 * 32 0 28 24; logo img 42.654px tall. List column padding 0 0 24px 14px,
 * scroll area margin-right 14px with a sticky "Categories" label
 * (14/28 #4e6382, padding 8px 16px). "New Category" pinned at the bottom.
 */
/** Group label (live "Categories"): 14/28 400 #4e6382, padding 8px 16px. */
const SECTION_LABEL =
  'm-0 box-border block w-full px-[16px] py-[8px] text-left text-[14px] leading-[28px] font-normal tracking-[0px] text-legacy-meta';

export function Sidebar() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const { pathname } = useLocation();
  const inAISection = pathname === SUGGESTIONS_HUB_PATH || pathname.startsWith(`${SUGGESTIONS_HUB_PATH}/`);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  const helpCenter = selectActiveHelpCenter(state);
  const categories = selectCategories(state);
  const pendingArticleCount = selectSuggestionArticles(state, 'TO_REVIEW').length;

  const handleCreate = (values: NewCategoryValues) => {
    const id = `cat-${values.slug}-${Date.now().toString(36)}`;
    dispatch({
      type: 'category/create',
      category: {
        id,
        helpCenterId: helpCenter.id,
        slug: values.slug,
        title: values.title,
        description: values.description,
        icon: values.icon,
      },
    });
    setNewCategoryOpen(false);
    navigate(`/${helpCenter.slug}/category/${values.slug}`);
  };

  return (
    <>
      <nav
        aria-label="Help Center"
        className="box-border flex h-screen max-w-[243px] min-w-[243px] grow flex-col overflow-hidden bg-legacy-sidebar select-none"
      >
        <div className="box-border mt-[32px] mr-0 mb-[28px] ml-[24px] flex h-[41px] items-center">
          <img alt="Hiver Help Center" src={sidebarLogo} className="w-auto rounded-none" style={{ height: '42.65402603149414px' }} />
        </div>
        <HelpCenterPicker
          helpCenters={Object.values(state.helpCenters)}
          activeId={state.activeHelpCenterId}
          onSelect={() => undefined}
        />
        <div className="box-border flex h-full flex-col justify-between overflow-hidden pt-0 pr-0 pb-[24px] pl-[14px]">
          {/* AI section: its own group above the categories cluster. */}
          <div className="mr-[14px] shrink-0">
            <h2 className={SECTION_LABEL}>AI</h2>
            <ul className="relative m-0 list-none p-0">
              <SuggestionsNavItem to={SUGGESTIONS_HUB_PATH} selected={inAISection} pendingCount={pendingArticleCount} />
            </ul>
            <div aria-hidden className="mx-[16px] my-[8px] h-px bg-legacy-divider" />
          </div>
          <div className="relative mr-[14px] grow overflow-y-auto">
            <h2 className={cn(SECTION_LABEL, 'sticky top-0 z-[2] bg-legacy-sidebar')}>
              Categories
            </h2>
            <ul className="relative m-0 list-none p-0">
              {categories.map((category) => (
                <CategoryNavItem
                  key={category.id}
                  category={category}
                  selected={!inAISection && category.slug === categorySlug}
                  to={`/${helpCenter.slug}/category/${category.slug}`}
                />
              ))}
            </ul>
          </div>
          <div className="mr-[14px]">
            <Button variant="primary" iconSrc={plusIcon} className="w-full" onClick={() => setNewCategoryOpen(true)}>
              New Category
            </Button>
          </div>
        </div>
      </nav>
      {helpCenter.isInternal ? (
        <div className="absolute top-[35px] left-[200px] box-border flex h-[38px] items-center">
          <TooltipIconButton label="Internal Help Center" src={lockIcon} size={22} />
        </div>
      ) : null}
      {newCategoryOpen ? (
        <NewCategoryModal
          open
          onOpenChange={setNewCategoryOpen}
          existingTitles={categories.map((c) => c.title)}
          onCreate={handleCreate}
        />
      ) : null}
    </>
  );
}

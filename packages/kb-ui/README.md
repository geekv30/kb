# @test-kb-ui/kb-ui

Pixel-perfect React component library for Hiver's knowledge base product — primitives, shell, nav, content, editor, AI gap review surface, and analytics in one package.

## Install

```bash
npm install @test-kb-ui/kb-ui
```

## Quickstart

```tsx
import { AppShell, KBBreadcrumbBar, SideNavRail, FileExplorerNav } from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

export function App() {
  return (
    <AppShell
      rail={<SideNavRail items={[]} activeId="home" />}
      explorer={<FileExplorerNav items={[]} />}
      breadcrumb={<KBBreadcrumbBar items={[{ id: 'home', label: 'Knowledge base' }]} />}
    >
      {/* your KB content here */}
    </AppShell>
  );
}
```

## Documentation

- [Repo README](https://github.com/geekv30/kb#readme)
- Storybook (local: clone the repo, run `npm run kb-ui:storybook`)

## License

MIT

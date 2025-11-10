# Copilot Instructions for PLC Automation Suite

## Project Overview

**PLC Automation Suite** is a React + TypeScript + Vite web app for industrial automation project management. It integrates Supabase for multi-user authentication and PostgreSQL persistence, supporting complex Modbus communication configuration, I/O point management, cause-effect logic matrices, and HMI/SCADA integration details.

### Core Architecture

- **Frontend**: React 18 (TSX components) + Tailwind CSS + Lucide icons
- **Backend**: Supabase (PostgSQL + Auth)
- **Build**: Vite with React plugin
- **Key Entry**: `src/App.tsx` (auth state → ProjectList → ProjectWorkspace)

## Data Model & Key Tables

All Supabase tables use **Row Level Security (RLS)** with project ownership policies:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `projects` | Project container | `id`, `user_id`, `name`, `plc_type`, `hmi_type`, `hmi_details` |
| `io_points` | I/O (DI/DO/AI/AO) definitions | `tag_name`, `io_type`, `address`, `modbus_register`, `range_min/max`, `engineering_units` |
| `cause_effect_matrix` | Control logic relationships | `cause_id`, `effect_id`, `logic_type`, `time_delay`, `priority`, `description` |
| `modbus_register_map` | Modbus device configuration | `table_number`, `start_register`, `conversion_code`, `comm_port` |
| `modbus_master_table` | Master-slave Modbus mapping | `function_code` (1-6, 15-16), `slave_register`, `master_register` |
| `comm_port_settings` | Serial/network communication | `port_name`, `baud_rate`, `parity`, `data_bits`, `stop_bits` |

**Important**: All database operations in components call `supabase.from('table_name')` with automatic project filtering through RLS policies.

## Component Hierarchy & Responsibilities

```
App.tsx (auth state, tab routing)
├── AuthForm.tsx (Supabase auth)
├── ProjectList.tsx (CRUD projects)
└── ProjectWorkspace.tsx (tab orchestrator - loads all project data)
    ├── IOList.tsx (I/O CRUD + CSV import)
    ├── CauseEffectMatrix.tsx (logic relationships)
    ├── ModbusRegisterMap.tsx (register configuration)
    ├── ModbusMasterTable.tsx (FC 1-6, 15-16)
    ├── CommPortSettings.tsx (baud/parity config)
    └── Presentation.tsx (demo/slideshow)
```

**ProjectWorkspace patterns**:
- Manages all project data in local state (refetch via `loadData()`)
- Passes `projectId` + `onUpdate` callback to child components
- Child components call `supabase` operations directly, then trigger parent refresh
- Export/generation buttons (Excel, Control Theory, Ladder Logic) compute text from local state

## Key Development Patterns

### 1. **Supabase Client & Types** (`lib/supabase.ts`)
- Single client instance exported module-wide
- TypeScript types (`Project`, `IOPoint`, etc.) mirror database schema exactly
- Auth state managed in `App.tsx` via `supabase.auth` listeners
- No custom hooks—direct `supabase.from()` calls with `.eq('project_id', projectId)` filters

### 2. **CSV Import** (`lib/fileImportUtils.ts`)
- Custom CSV parser handles quoted values and commas
- Header matching is flexible (e.g., `includes('tag')` matches "Tag Name" or "Tag")
- Batch inserts all rows at once via `supabase.insert()`
- Used only in `IOList.tsx` via file input

### 3. **Export & Code Generation** (`lib/exportUtils.ts`)
- `exportToExcel()` generates CSV with IO_LIST and CAUSE_EFFECT_MATRIX sections
- `generateControlTheory()` creates formatted text doc with system summary + logic descriptions
- `generateLadderLogic()` outputs IEC 61131-3 STL pseudocode with TON declarations for time delays
- All use `ioMap = Map(ioPoints.map(io => [io.id, io]))` to join cause/effect IDs to tag names

### 4. **Form State Management**
- Each data-editing component (IOList, ModbusMasterTable, etc.) owns form state locally
- Pattern: `formData` state + `resetForm()` on cancel + `editingId` tracks edit mode
- Submit calls `supabase.from('table').insert()` or `.update()` + `onUpdate()` callback

### 5. **Tab Navigation**
- `activeTab` state in ProjectWorkspace controls conditional rendering
- Tab buttons toggle state; generated content (theory/ladder) auto-reveal new tabs
- No routing library—purely state-driven UI switching

## Common Tasks & Implementation Notes

### Adding a New Field to I/O Points
1. Add column to migration SQL (check constraint if enum)
2. Update `IOPoint` type in `lib/supabase.ts`
3. Add form field in `IOList.tsx` form
4. Include in CSV parser header matching (e.g., `headers.findIndex(h => h.includes('new_field'))`)
5. Export functions update automatically if using spread operators

### Adding a New Component Tab
1. Define `Tab` type union in `ProjectWorkspace.tsx`
2. Add button in tab bar with conditional active styling
3. Add conditional render in content area
4. If reading/writing data, include `loadData()` call or pass `onUpdate` callback

### Modbus Configuration Workflow
1. **Register Map**: Define device parameter blocks (start/end registers, conversion codes 0-85)
2. **Master Table**: Configure function codes (FC1-6=read/write coils/registers, FC15-16=write multiple)
3. **Comm Settings**: Set baud rates (1200-115200), parity, data bits per port
4. Functions are independent; UI doesn't auto-sync across tabs—users configure each sequentially

### Control Logic Matrix
- `cause_id` and `effect_id` are foreign keys to `io_points`
- `logic_type` values: AND, OR, NOT (used in ladder generation but not enforced)
- `time_delay` in seconds; generates TON blocks in ladder logic if > 0
- UI shows dropdown of available I/O tags (from `ioPoints` array)

## Build & Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # Production bundle
npm run typecheck    # TSC validation (errors not fatal)
npm run lint         # ESLint (config in eslint.config.js)
npm run preview      # Test production build locally
```

**Environment Variables** (`.env`):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Styling & UI Conventions

- **Tailwind** for all styling; no CSS modules or emotion
- **Color scheme**: Slate/gray base (`slate-50` backgrounds, `slate-900` text)
- **Action buttons**: Blue primary (`bg-blue-600`), green for success, orange for export, red for delete
- **Icons**: Lucide React; imported by name (e.g., `<Download size={18} />`)
- **Tables/Forms**: Custom HTML + Tailwind (no component library)
- **Responsive**: Max-width container `max-w-7xl mx-auto` with `px-6` gutters

## Testing & Debugging

- No test suite in repo; use browser DevTools + Supabase dashboard for validation
- Check RLS policies if queries return empty results
- Ensure `.env` vars are set before `npm run dev`
- CSS issues? Clear Vite cache: `rm -rf node_modules/.vite`
- TypeScript errors halt build; run `npm run typecheck` to catch early

## Security Notes

- All table queries filtered by `auth.uid() = user_id` at RLS layer
- Anon key only has authenticated access (no anonymous public tables)
- Never expose `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in client—stored in `.env` only
- No server-side API layer; Supabase PostgREST queries execute from client with RLS enforcement

## Deployment

- **Netlify**: Run `npm run build`, deploy `dist/` folder
- **Environment variables**: Set `VITE_SUPABASE_*` in hosting platform (not `.env`)
- See `DEPLOYMENT.md` for step-by-step or run `./deploy-netlify.sh`

## References

- **README.md**: Full user guide + CSV import format
- **Supabase migrations**: `supabase/migrations/` folder (auto-applied by MCP)
- **VSCode Extensions**: ESLint plugin recommended for real-time linting

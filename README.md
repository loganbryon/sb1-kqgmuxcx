# PLC Automation Suite

A comprehensive web-based tool for managing industrial automation projects with advanced Modbus communication configuration, I/O management, and HMI integration.

## Features

### Core Functionality
- **Project Management** - Create and manage multiple automation control projects
- **I/O List Management** - Define digital and analog inputs/outputs with full specifications
- **Cause & Effect Matrix** - Configure automation logic and interlocks
- **CSV/XLSX Import** - Bulk import I/O points from spreadsheet files

### Advanced Modbus Features
- **Modbus Register Map** - Configure RS-485 Modbus communication between controller and field devices
  - Table and index organization
  - Register ranges and device parameters
  - Conversion codes (0-85)
  - Multi-port support (Local Port, COM 1-5)

- **Master Table Configuration** - Complete Modbus master-slave setup
  - All 8 function codes supported (FC 1-6, 15-16)
  - TRU addressing
  - Slave/Master register mapping
  - Register quantity specification

- **Communication Port Settings** - Comprehensive serial communication configuration
  - RS-232, RS-485, RS-422, Ethernet, Fiber Optic
  - Baud rates: 1200-115200
  - Parity, data bits, stop bits
  - Port owner assignment

### HMI/SCADA Integration
- HMI type specification
- Configuration details tracking
- Support for web-based SCADA systems
- Common platform references (Ignition, FactoryTalk, WinCC, etc.)

### Supported PLC Types
- Siemens S7-1200/1500
- Allen-Bradley ControlLogix/CompactLogix
- Mitsubishi FX5
- Schneider Modicon M580
- ABB XIO
- ROC800
- GE Fanuc
- IDEC
- Generic PLC

### Export & Documentation
- Export to Excel/CSV
- Generate control theory documentation
- Generate ladder logic pseudocode

## Quick Start

### Prerequisites
- Node.js 18 or higher
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone YOUR_REPO_URL
cd plc-automation-suite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Database Setup

The application uses Supabase for data persistence. Database migrations are located in `supabase/migrations/`:

1. `20251107190936_create_automation_tables.sql` - Base tables
2. `20251108034043_add_modbus_and_hmi_features.sql` - Modbus and HMI features

These migrations are automatically applied when using the Supabase MCP tools.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Netlify

```bash
./deploy-netlify.sh
```

Or manually:
```bash
npm run build
netlify deploy --prod
```

Remember to add environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx              # Authentication UI
│   │   ├── ProjectList.tsx           # Project management
│   │   ├── ProjectWorkspace.tsx      # Main workspace with tabs
│   │   ├── IOList.tsx                # I/O point management
│   │   ├── CauseEffectMatrix.tsx     # Logic matrix
│   │   ├── ModbusRegisterMap.tsx     # Modbus register configuration
│   │   ├── ModbusMasterTable.tsx     # Master-slave table
│   │   └── CommPortSettings.tsx      # Communication settings
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client & types
│   │   ├── exportUtils.ts            # Export functionality
│   │   └── fileImportUtils.ts        # CSV/XLSX import
│   ├── App.tsx                       # Main application
│   └── main.tsx                      # Entry point
├── supabase/
│   └── migrations/                   # Database migrations
├── DEPLOYMENT.md                     # Deployment guide
└── package.json
```

## Usage Guide

### Creating a Project

1. Log in or create an account
2. Click "New Project"
3. Enter project details:
   - Name and description
   - PLC type selection
   - HMI type and configuration details
4. Click "Create"

### Managing I/O Points

1. Open a project
2. Go to "I/O List" tab
3. Click "Add I/O Point" or "Import CSV"
4. Fill in details:
   - Tag name
   - Description
   - I/O type (DI/DO/AI/AO)
   - PLC address
   - Modbus register
   - Engineering units (for analog)
   - Normal state (for digital)

### CSV Import Format

Your CSV should have these columns (any order):
- Tag Name / Tag
- Description / Desc
- Type / IO Type
- Address / PLC Address
- Modbus Register / Modbus
- Normal State
- Engineering Units / Units
- Range Min / Min
- Range Max / Max

Example:
```csv
Tag Name,Description,Type,PLC Address,Modbus Register,Normal State
PT-101,Inlet Pressure,AI,I0.0,40001,,
FV-201,Flow Control Valve,AO,Q0.0,40101,,
HS-301,Start Button,DI,I1.0,10001,Normally Open
```

### Configuring Modbus

1. **Register Map Tab:**
   - Define register ranges for each device
   - Set conversion codes
   - Assign communication ports
   - Organize with table/index numbers

2. **Master Table Tab:**
   - Configure master-slave relationships
   - Select appropriate function codes
   - Map slave and master registers
   - Specify register quantities

3. **Comm Settings Tab:**
   - Configure each serial port
   - Set baud rate, parity, data bits
   - Assign port owners
   - Use standard configurations or customize

### Modbus Optimization Tips

- Group consecutive registers to minimize read/write operations
- Keep register blocks within 125 words for optimal performance
- Use FC03 for holding registers, FC04 for input registers
- Implement proper error handling and timeouts
- Consider broadcast address (0) for writes to multiple slaves

## Technologies

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Netlify/Vercel ready

## Security

- Row Level Security (RLS) enabled on all database tables
- User authentication required for all operations
- Secure API key management through environment variables
- No sensitive data exposed in client-side code

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

## Contributing

This project was built as a comprehensive PLC automation management tool. Feel free to extend it with additional features:

- Additional PLC protocol support (Ethernet/IP, PROFINET)
- Real-time data monitoring
- Advanced visualization tools
- Integration with industrial databases
- Mobile app version

## License

MIT License - Feel free to use this project for commercial or personal purposes.

## Support

For issues, questions, or feature requests, please refer to the documentation:
- [Deployment Guide](./DEPLOYMENT.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)

---

Built with industrial automation professionals in mind. From small control systems to large SCADA deployments, this suite provides the tools you need to manage complex automation projects efficiently.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  plc_type: string;
  hmi_type: string;
  hmi_details: string;
  created_at: string;
  updated_at: string;
};

export type IOPoint = {
  id: string;
  project_id: string;
  tag_name: string;
  description: string;
  io_type: 'DI' | 'DO' | 'AI' | 'AO';
  address: string;
  modbus_register: string;
  normal_state: string;
  engineering_units: string;
  range_min: number;
  range_max: number;
  created_at: string;
};

export type CauseEffect = {
  id: string;
  project_id: string;
  cause_id: string;
  effect_id: string;
  logic_type: string;
  time_delay: number;
  priority: number;
  description: string;
  created_at: string;
};

export type ModbusRegisterMap = {
  id: string;
  project_id: string;
  table_number: number;
  index_number: number;
  start_register: number;
  end_register: number;
  device_parameter: string;
  indexing_type: 'Point' | 'Parameter';
  conversion_code: number;
  comm_port: string;
  created_at: string;
};

export type ModbusMasterTable = {
  id: string;
  project_id: string;
  register_map_id: string | null;
  tru_address: string;
  function_code: number;
  slave_register: number;
  master_register: number;
  number_of_registers: number;
  created_at: string;
};

export type CommPortSettings = {
  id: string;
  project_id: string;
  port_name: string;
  comm_type: string;
  baud_rate: number;
  parity: string;
  data_bits: number;
  stop_bits: number;
  port_owner: string;
  created_at: string;
};

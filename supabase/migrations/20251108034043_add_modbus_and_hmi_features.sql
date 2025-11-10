/*
  # Add Modbus and HMI Features

  1. Schema Changes
    - Add `modbus_register` column to `io_points` table
    - Add `hmi_type` and `hmi_details` columns to `projects` table
  
  2. New Tables
    - `modbus_register_map`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `table_number` (integer)
      - `index_number` (integer)
      - `start_register` (integer)
      - `end_register` (integer)
      - `device_parameter` (text)
      - `indexing_type` (text) - Point or Parameter
      - `conversion_code` (integer) - 0-85
      - `comm_port` (text)
      - `created_at` (timestamptz)
    
    - `modbus_master_table`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `register_map_id` (uuid, references modbus_register_map)
      - `tru_address` (text)
      - `function_code` (integer) - 1-6, 15-16
      - `slave_register` (integer)
      - `master_register` (integer)
      - `number_of_registers` (integer)
      - `created_at` (timestamptz)
    
    - `comm_port_settings`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `port_name` (text)
      - `comm_type` (text)
      - `baud_rate` (integer)
      - `parity` (text)
      - `data_bits` (integer)
      - `stop_bits` (integer)
      - `port_owner` (text)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users based on project ownership
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'io_points' AND column_name = 'modbus_register'
  ) THEN
    ALTER TABLE io_points ADD COLUMN modbus_register text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'hmi_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN hmi_type text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'hmi_details'
  ) THEN
    ALTER TABLE projects ADD COLUMN hmi_details text DEFAULT '';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS modbus_register_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  table_number integer DEFAULT 0,
  index_number integer DEFAULT 0,
  start_register integer DEFAULT 0,
  end_register integer DEFAULT 0,
  device_parameter text DEFAULT '',
  indexing_type text DEFAULT 'Point' CHECK (indexing_type IN ('Point', 'Parameter')),
  conversion_code integer DEFAULT 0 CHECK (conversion_code BETWEEN 0 AND 85),
  comm_port text DEFAULT 'Local Port',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modbus_master_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  register_map_id uuid REFERENCES modbus_register_map(id) ON DELETE SET NULL,
  tru_address text DEFAULT '',
  function_code integer DEFAULT 1 CHECK (function_code IN (1, 2, 3, 4, 5, 6, 15, 16)),
  slave_register integer DEFAULT 0,
  master_register integer DEFAULT 0,
  number_of_registers integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comm_port_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  port_name text NOT NULL,
  comm_type text DEFAULT 'RS-485',
  baud_rate integer DEFAULT 9600,
  parity text DEFAULT 'None',
  data_bits integer DEFAULT 8,
  stop_bits integer DEFAULT 1,
  port_owner text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modbus_register_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE modbus_master_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_port_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view modbus register map in their projects"
  ON modbus_register_map FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_register_map.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create modbus register map in their projects"
  ON modbus_register_map FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_register_map.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modbus register map in their projects"
  ON modbus_register_map FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_register_map.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_register_map.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modbus register map in their projects"
  ON modbus_register_map FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_register_map.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view modbus master table in their projects"
  ON modbus_master_table FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_master_table.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create modbus master table in their projects"
  ON modbus_master_table FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_master_table.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modbus master table in their projects"
  ON modbus_master_table FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_master_table.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_master_table.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modbus master table in their projects"
  ON modbus_master_table FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = modbus_master_table.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view comm port settings in their projects"
  ON comm_port_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comm_port_settings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comm port settings in their projects"
  ON comm_port_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comm_port_settings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update comm port settings in their projects"
  ON comm_port_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comm_port_settings.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comm_port_settings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete comm port settings in their projects"
  ON comm_port_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comm_port_settings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_modbus_register_map_project_id ON modbus_register_map(project_id);
CREATE INDEX IF NOT EXISTS idx_modbus_master_table_project_id ON modbus_master_table(project_id);
CREATE INDEX IF NOT EXISTS idx_modbus_master_table_register_map_id ON modbus_master_table(register_map_id);
CREATE INDEX IF NOT EXISTS idx_comm_port_settings_project_id ON comm_port_settings(project_id);
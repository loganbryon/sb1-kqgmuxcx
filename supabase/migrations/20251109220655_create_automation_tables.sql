/*
  # Create Automation App Tables

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Project name
      - `description` (text) - Project description
      - `plc_type` (text) - PLC type/brand (e.g., Siemens, Allen-Bradley, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `io_points`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `tag_name` (text) - Tag/variable name
      - `description` (text) - IO point description
      - `io_type` (text) - Type: DI, DO, AI, AO
      - `address` (text) - PLC address
      - `normal_state` (text) - Normal state for digital inputs
      - `engineering_units` (text) - Units for analog signals
      - `range_min` (numeric) - Minimum range for analog
      - `range_max` (numeric) - Maximum range for analog
      - `created_at` (timestamptz)
    
    - `cause_effect_matrix`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `cause_id` (uuid, references io_points) - Input/cause
      - `effect_id` (uuid, references io_points) - Output/effect
      - `logic_type` (text) - AND, OR, NOT, etc.
      - `time_delay` (numeric) - Time delay in seconds
      - `priority` (integer) - Priority level
      - `description` (text) - Relationship description
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own projects
    - Add policies for project-related data based on project ownership
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  plc_type text DEFAULT 'Generic',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS io_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  tag_name text NOT NULL,
  description text DEFAULT '',
  io_type text NOT NULL CHECK (io_type IN ('DI', 'DO', 'AI', 'AO')),
  address text DEFAULT '',
  normal_state text DEFAULT '',
  engineering_units text DEFAULT '',
  range_min numeric DEFAULT 0,
  range_max numeric DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cause_effect_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  cause_id uuid REFERENCES io_points(id) ON DELETE CASCADE NOT NULL,
  effect_id uuid REFERENCES io_points(id) ON DELETE CASCADE NOT NULL,
  logic_type text DEFAULT 'AND',
  time_delay numeric DEFAULT 0,
  priority integer DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE io_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE cause_effect_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view IO points in their projects"
  ON io_points FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = io_points.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create IO points in their projects"
  ON io_points FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = io_points.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update IO points in their projects"
  ON io_points FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = io_points.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = io_points.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete IO points in their projects"
  ON io_points FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = io_points.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view cause-effect matrix in their projects"
  ON cause_effect_matrix FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = cause_effect_matrix.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cause-effect matrix in their projects"
  ON cause_effect_matrix FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = cause_effect_matrix.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cause-effect matrix in their projects"
  ON cause_effect_matrix FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = cause_effect_matrix.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = cause_effect_matrix.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cause-effect matrix in their projects"
  ON cause_effect_matrix FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = cause_effect_matrix.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_io_points_project_id ON io_points(project_id);
CREATE INDEX IF NOT EXISTS idx_cause_effect_matrix_project_id ON cause_effect_matrix(project_id);
CREATE INDEX IF NOT EXISTS idx_cause_effect_matrix_cause_id ON cause_effect_matrix(cause_id);
CREATE INDEX IF NOT EXISTS idx_cause_effect_matrix_effect_id ON cause_effect_matrix(effect_id);
/*
  # Network Topology Table

  1. New Tables
    - `network_topology`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `device_name` (text) - Name of the network device
      - `device_type` (text) - Type: PLC, HMI, Switch, Router, Gateway, Sensor, etc.
      - `ip_address` (text) - IP address of the device
      - `subnet_mask` (text) - Subnet mask
      - `gateway` (text) - Default gateway
      - `mac_address` (text) - MAC address if applicable
      - `port` (text) - Port number or connection info
      - `protocol` (text) - Communication protocol: Ethernet/IP, Modbus TCP, Profinet, etc.
      - `description` (text) - Additional notes
      - `position_x` (numeric) - X position for visual topology diagram
      - `position_y` (numeric) - Y position for visual topology diagram
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `network_topology` table
    - Add policies for authenticated users to manage topology in their own projects

  3. Indexes
    - Add index on project_id foreign key for optimal performance
*/

CREATE TABLE IF NOT EXISTS public.network_topology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  device_name text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT 'PLC',
  ip_address text NOT NULL DEFAULT '',
  subnet_mask text DEFAULT '',
  gateway text DEFAULT '',
  mac_address text DEFAULT '',
  port text DEFAULT '',
  protocol text DEFAULT '',
  description text DEFAULT '',
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_topology_project_id ON public.network_topology(project_id);

ALTER TABLE public.network_topology ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view network topology in their projects"
  ON public.network_topology FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = network_topology.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create network topology in their projects"
  ON public.network_topology FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id
      AND projects.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update network topology in their projects"
  ON public.network_topology FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = network_topology.project_id
      AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id
      AND projects.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete network topology in their projects"
  ON public.network_topology FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = network_topology.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

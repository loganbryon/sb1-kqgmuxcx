import { supabase } from './supabase';

export const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
};

export const importIOPointsFromFile = async (
  file: File,
  projectId: string
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return { success: false, count: 0, error: 'File is empty or invalid' };
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    const tagIndex = headers.findIndex(h => h.includes('tag'));
    const descIndex = headers.findIndex(h => h.includes('desc'));
    const typeIndex = headers.findIndex(h => h.includes('type'));
    const addressIndex = headers.findIndex(h => h.includes('address') && !h.includes('modbus'));
    const modbusIndex = headers.findIndex(h => h.includes('modbus'));
    const normalStateIndex = headers.findIndex(h => h.includes('normal'));
    const unitsIndex = headers.findIndex(h => h.includes('unit'));
    const minIndex = headers.findIndex(h => h.includes('min'));
    const maxIndex = headers.findIndex(h => h.includes('max'));

    const ioPoints = dataRows
      .filter(row => row[tagIndex]?.trim())
      .map(row => {
        const ioType = (row[typeIndex]?.trim().toUpperCase() || 'DI') as 'DI' | 'DO' | 'AI' | 'AO';

        return {
          project_id: projectId,
          tag_name: row[tagIndex]?.trim() || '',
          description: row[descIndex]?.trim() || '',
          io_type: ['DI', 'DO', 'AI', 'AO'].includes(ioType) ? ioType : 'DI',
          address: row[addressIndex]?.trim() || '',
          modbus_register: row[modbusIndex]?.trim() || '',
          normal_state: row[normalStateIndex]?.trim() || '',
          engineering_units: row[unitsIndex]?.trim() || '',
          range_min: parseFloat(row[minIndex]) || 0,
          range_max: parseFloat(row[maxIndex]) || 100,
        };
      });

    if (ioPoints.length === 0) {
      return { success: false, count: 0, error: 'No valid data found in file' };
    }

    const { error } = await supabase.from('io_points').insert(ioPoints);

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: ioPoints.length };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

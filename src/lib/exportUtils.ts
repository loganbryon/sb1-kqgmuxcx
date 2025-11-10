import { IOPoint, CauseEffect } from './supabase';

export const exportToExcel = (
  projectName: string,
  ioPoints: IOPoint[],
  causeEffects: CauseEffect[]
) => {
  const ioMap = new Map(ioPoints.map(io => [io.id, io]));

  let csvContent = 'data:text/csv;charset=utf-8,';

  csvContent += '=== IO LIST ===\n';
  csvContent += 'Tag Name,Description,Type,Address,Normal State,Units,Range Min,Range Max\n';
  ioPoints.forEach(io => {
    csvContent += `${io.tag_name},${io.description},${io.io_type},${io.address},${io.normal_state},${io.engineering_units},${io.range_min},${io.range_max}\n`;
  });

  csvContent += '\n=== CAUSE AND EFFECT MATRIX ===\n';
  csvContent += 'Cause Tag,Cause Description,Effect Tag,Effect Description,Logic Type,Time Delay (s),Priority,Description\n';
  causeEffects.forEach(ce => {
    const cause = ioMap.get(ce.cause_id);
    const effect = ioMap.get(ce.effect_id);
    csvContent += `${cause?.tag_name || ''},${cause?.description || ''},${effect?.tag_name || ''},${effect?.description || ''},${ce.logic_type},${ce.time_delay},${ce.priority},${ce.description}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${projectName}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateControlTheory = (
  projectName: string,
  plcType: string,
  ioPoints: IOPoint[],
  causeEffects: CauseEffect[]
): string => {
  const ioMap = new Map(ioPoints.map(io => [io.id, io]));

  let theory = `CONTROL THEORY DOCUMENT\n`;
  theory += `Project: ${projectName}\n`;
  theory += `PLC Type: ${plcType}\n`;
  theory += `Generated: ${new Date().toLocaleString()}\n`;
  theory += `\n${'='.repeat(80)}\n\n`;

  theory += `1. SYSTEM OVERVIEW\n\n`;
  theory += `This control system manages ${ioPoints.length} I/O points with ${causeEffects.length} cause-effect relationships.\n\n`;

  theory += `2. INPUT/OUTPUT SUMMARY\n\n`;
  const diCount = ioPoints.filter(io => io.io_type === 'DI').length;
  const doCount = ioPoints.filter(io => io.io_type === 'DO').length;
  const aiCount = ioPoints.filter(io => io.io_type === 'AI').length;
  const aoCount = ioPoints.filter(io => io.io_type === 'AO').length;
  theory += `Digital Inputs (DI): ${diCount}\n`;
  theory += `Digital Outputs (DO): ${doCount}\n`;
  theory += `Analog Inputs (AI): ${aiCount}\n`;
  theory += `Analog Outputs (AO): ${aoCount}\n\n`;

  theory += `3. CONTROL LOGIC DESCRIPTION\n\n`;
  causeEffects.forEach((ce, index) => {
    const cause = ioMap.get(ce.cause_id);
    const effect = ioMap.get(ce.effect_id);
    theory += `Logic ${index + 1}:\n`;
    theory += `  Cause: ${cause?.tag_name} (${cause?.description})\n`;
    theory += `  Effect: ${effect?.tag_name} (${effect?.description})\n`;
    theory += `  Logic Type: ${ce.logic_type}\n`;
    theory += `  Time Delay: ${ce.time_delay}s\n`;
    theory += `  Priority: ${ce.priority}\n`;
    theory += `  Description: ${ce.description}\n\n`;
  });

  theory += `4. SAFETY CONSIDERATIONS\n\n`;
  theory += `- All interlocks should be verified before commissioning\n`;
  theory += `- Emergency stop functions must override all normal operations\n`;
  theory += `- Critical alarms should be logged and require acknowledgment\n\n`;

  return theory;
};

export const generateLadderLogic = (
  projectName: string,
  plcType: string,
  ioPoints: IOPoint[],
  causeEffects: CauseEffect[]
): string => {
  const ioMap = new Map(ioPoints.map(io => [io.id, io]));

  let ladder = `(* LADDER LOGIC TEMPLATE *)\n`;
  ladder += `(* Project: ${projectName} *)\n`;
  ladder += `(* PLC Type: ${plcType} *)\n`;
  ladder += `(* Generated: ${new Date().toLocaleString()} *)\n\n`;

  ladder += `(* ============================================ *)\n`;
  ladder += `(* I/O DECLARATIONS *)\n`;
  ladder += `(* ============================================ *)\n\n`;

  ladder += `(* Digital Inputs *)\n`;
  ioPoints.filter(io => io.io_type === 'DI').forEach(io => {
    ladder += `${io.tag_name} AT ${io.address} : BOOL; (* ${io.description} *)\n`;
  });

  ladder += `\n(* Digital Outputs *)\n`;
  ioPoints.filter(io => io.io_type === 'DO').forEach(io => {
    ladder += `${io.tag_name} AT ${io.address} : BOOL; (* ${io.description} *)\n`;
  });

  ladder += `\n(* Analog Inputs *)\n`;
  ioPoints.filter(io => io.io_type === 'AI').forEach(io => {
    ladder += `${io.tag_name} AT ${io.address} : REAL; (* ${io.description}, ${io.range_min}-${io.range_max} ${io.engineering_units} *)\n`;
  });

  ladder += `\n(* Analog Outputs *)\n`;
  ioPoints.filter(io => io.io_type === 'AO').forEach(io => {
    ladder += `${io.tag_name} AT ${io.address} : REAL; (* ${io.description}, ${io.range_min}-${io.range_max} ${io.engineering_units} *)\n`;
  });

  ladder += `\n(* ============================================ *)\n`;
  ladder += `(* CONTROL LOGIC *)\n`;
  ladder += `(* ============================================ *)\n\n`;

  causeEffects.forEach((ce, index) => {
    const cause = ioMap.get(ce.cause_id);
    const effect = ioMap.get(ce.effect_id);

    ladder += `(* Logic ${index + 1}: ${ce.description} *)\n`;
    ladder += `(* ${cause?.description} -> ${effect?.description} *)\n`;

    if (ce.time_delay > 0) {
      ladder += `TON_${index} : TON;\n`;
      ladder += `TON_${index}(IN:=${cause?.tag_name}, PT:=T#${ce.time_delay}s);\n`;
      ladder += `${effect?.tag_name} := TON_${index}.Q;\n\n`;
    } else {
      if (ce.logic_type === 'AND') {
        ladder += `${effect?.tag_name} := ${cause?.tag_name};\n\n`;
      } else if (ce.logic_type === 'NOT') {
        ladder += `${effect?.tag_name} := NOT ${cause?.tag_name};\n\n`;
      } else {
        ladder += `${effect?.tag_name} := ${cause?.tag_name};\n\n`;
      }
    }
  });

  ladder += `(* ============================================ *)\n`;
  ladder += `(* END OF PROGRAM *)\n`;
  ladder += `(* ============================================ *)\n`;

  return ladder;
};

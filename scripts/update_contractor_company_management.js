const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../client/src/pages/ContractorCompany/ContractorCompanyManagement.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<MdListAlt /> Add BOM (Rate)',
  '<MdListAlt /> Assign Work (Rate)'
);
content = content.replace(
  '<span className="cctbh-finance-pill-lbl">BOM Work Value</span>',
  '<span className="cctbh-finance-pill-lbl">Work Contract Value</span>'
);
content = content.replace(
  '📋 Assigned BOMs with Contracted Rates & Quantity:',
  '📋 Assigned Work Descriptions with Contracted Rates & Quantity:'
);
content = content.replace(
  'No BOM parts allocated to this team yet. Click "Add BOM (Rate)" to assign parts.',
  'No work descriptions allocated to this team yet. Click "Assign Work (Rate)" to assign work.'
);
content = content.replace(
  '<th>BOM Part Name</th>',
  '<th>Work Description</th>'
);
content = content.replace(
  '{item.bom_name}',
  '{item.work_description || item.work_description_name || item.bom_name}'
);
content = content.replaceAll(
  'title="Edit BOM Assignment & Rates"',
  'title="Edit Work Assignment & Rates"'
);
content = content.replaceAll(
  'title="Delete BOM Assignment"',
  'title="Delete Work Assignment"'
);
content = content.replaceAll(
  'if (window.confirm("Delete this BOM assignment?"))',
  'if (window.confirm("Delete this work assignment?"))'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('ContractorCompanyManagement.jsx updated successfully.');

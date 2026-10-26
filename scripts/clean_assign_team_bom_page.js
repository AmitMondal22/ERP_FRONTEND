const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../client/src/pages/ContractorCompany/AssignTeamBom/AssignTeamBomPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Error message
content = content.replace(
  'Please select a Contractor Team to assign BOM items.',
  'Please select a Contractor Team to assign work description items.'
);

// 2. Section 1 tip
content = content.replace(
  'save changes directly without BOM items.',
  'save changes directly without work description items.'
);

// 3. Fallback item name
content = content.replace(
  'bom_name: "⚠️ No work descriptions assigned yet"',
  'work_description: "⚠️ No work descriptions assigned yet", bom_name: "⚠️ No work descriptions assigned yet"'
);

// 4. Failed delete error
content = content.replaceAll(
  'Failed to delete BOM item',
  'Failed to delete work description item'
);

// 5. User-facing messages
content = content.replaceAll(
  'Failed to load previous BOM assignments',
  'Failed to load previous work assignments'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('AssignTeamBomPage.jsx cleaned up successfully.');

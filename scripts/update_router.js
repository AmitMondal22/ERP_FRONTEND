const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../client/src/router/Router.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `        <Route
          path="/contractor-company/assign-bom"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AssignTeamBomPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />`;

const replacement = `        <Route
          path="/contractor-company/assign-bom"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AssignTeamBomPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contractor-company/assign-work-description"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AssignTeamBomPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contractor-company/assign-work"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AssignTeamBomPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Router.jsx updated with new routes!');
} else {
  // Handle CRLF
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacementCRLF);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Router.jsx updated with new routes (CRLF)!');
  } else {
    console.error('Target not found in Router.jsx');
  }
}

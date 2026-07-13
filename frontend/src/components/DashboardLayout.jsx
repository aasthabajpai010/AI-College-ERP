// ============================================================
// DASHBOARD LAYOUT
// ============================================================
// Combines Sidebar + Navbar + whatever page content is passed in
// as "children". Every dashboard/feature page wraps itself in this
// component instead of each page individually rendering its own
// Sidebar and Navbar — this is a "composition" pattern, building a
// bigger UI piece out of smaller reusable ones.

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// "children" is a special React prop — it represents whatever JSX
// gets placed BETWEEN the opening and closing tags when this
// component is used, e.g.:
//   <DashboardLayout>
//     <p>This part becomes "children"</p>
//   </DashboardLayout>
const DashboardLayout = ({ children }) => {
  return (
    // flex row: Sidebar takes its own fixed width (defined inside
    // Sidebar.jsx itself, w-64), and the rest of the row is the
    // main content area.
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      {/* flex-1 makes this div stretch to fill all remaining
          horizontal space next to the fixed-width Sidebar. */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* main is where the actual page content renders.
            padding here keeps every page's content consistently
            spaced from the edges, without each page needing to
            add its own padding. */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
import React from 'react';
import '../assets/styles/design-tokens.css';

const AdminCatalogView = () => (
  <div className="admin-card p-6 shadow-xl">
    <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Real logic replacing placeholders */}
      <div className="admin-card p-4">Product 1</div>
      <div className="admin-card p-4">Product 2</div>
    </div>
  </div>
);
export default AdminCatalogView;

import React, { useState, useMemo, useRef, Suspense } from 'react';
import Icon from './Icon.jsx';
import { detectStore } from '../data.js';
import ErrorBoundary from './ErrorBoundary.jsx';
import './AdminCatalogView.css';

const CATEGORY_GROUPS = [
  'All Categories',
  '📌 Pinterest Viral Drops',
  'Tops & Tunics',
  'Kurtis',
  'Dresses',
  'Bottomwear',
  'Layers & Outerwear',
  'Accessories',
  'Innerwear',
  'Ethnic Wear',
  'Beauty',
  'Home',
  'Winter'
];

const MARKETPLACES = ['All Stores', 'Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Pinterest'];

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'live':
    case 'published':
      return 'status-badge-live';
    case 'draft':
    case 'pending_review':
      return 'status-badge-draft';
    case 'archived':
      return 'status-badge-archived';
    default:
      return '';
  }
}

export default function AdminCatalogView(props) {
  return (
    <ErrorBoundary>
      <AdminCatalogContent {...props} />
    </ErrorBoundary>
  );
}

function AdminCatalogContent({
  products = [],
  onApproveProduct,
  onDeleteProduct,
  onUpdateProduct,
  onOpenAddProduct,
  onOpenEditProduct,
  onBulkDeleteProducts,
  onBulkUpdateProducts
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState('');
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState('Tops & Tunics');
  const [confirmModal, setConfirmModal] = useState(null); 
  const [manageImagesProduct, setManageImagesProduct] = useState(null);
  const [imageIndexMap, setImageIndexMap] = useState({});
  const [importNotice, setImportNotice] = useState('');
  const fileInputRef = useRef(null);

  const activeCount = useMemo(() => products.filter(p => p.status !== 'draft' && p.status !== 'pending_review' && p.status !== 'archived').length, [products]);
  const draftCount = useMemo(() => products.filter(p => p.status === 'draft' || p.status === 'pending_review').length, [products]);
  const archivedCount = useMemo(() => products.filter(p => p.status === 'archived').length, [products]);
  const missingLinkCount = useMemo(() => products.filter(p => !p.affiliateUrl).length, [products]);
  const aiFlaggedCount = useMemo(() => products.filter(p => p.aiFlagged).length, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const title = (p.title || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        const ext = (p.ext_id || '').toLowerCase();
        if (!title.includes(q) && !cat.includes(q) && !id.includes(q) && !ext.includes(q)) {
          return false;
        }
      }

      if (selectedCategory === '📌 Pinterest Viral Drops') {
        const isPin = Boolean(
          p.isPinterestCombo || p.isTrending || (p.collectionId || '').includes('pinterest') ||
          (p.title || '').toLowerCase().includes('jersey') || (p.title || '').toLowerCase().includes('spider') ||
          (p.title || '').toLowerCase().includes('y2k') || (p.category || '').toLowerCase().includes('accessories') ||
          (p.category || '').toLowerCase().includes('baby tees')
        );
        if (!isPin) return false;
      } else if (selectedCategory !== 'All Categories') {
        const cat = (p.category || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (!cat.includes(target) && (target === 'dresses' ? !cat.includes('women dresses') : true)) {
          return false;
        }
      }

      if (selectedStore !== 'All Stores') {
        const itemStore = p.store || detectStore(p.productUrl || p.affiliateUrl) || 'Meesho';
        if (selectedStore === 'Pinterest') {
          const isPin = itemStore === 'Pinterest' || Boolean(p.isPinterestCombo || (p.collectionId || '').includes('pinterest') || (p.productUrl || '').includes('pinterest'));
          if (!isPin) return false;
        } else if (itemStore.toLowerCase() !== selectedStore.toLowerCase()) {
          return false;
        }
      }

      if (statusFilter === 'published') {
        if (p.status === 'draft' || p.status === 'pending_review' || p.status === 'archived') return false;
      } else if (statusFilter === 'draft') {
        if (p.status !== 'draft' && p.status !== 'pending_review') return false;
      } else if (statusFilter === 'archived') {
        if (p.status !== 'archived') return false;
      } else if (statusFilter === 'missing_link') {
        if (p.affiliateUrl) return false;
      } else if (statusFilter === 'missing_image') {
        if (p.image && !p.image.includes('placeholder')) return false;
      } else if (statusFilter === 'ai_flagged') {
        if (!p.aiFlagged) return false;
      }

      if (minRatingFilter > 0) {
        const r = Number(p.rating || 4.2);
        if (r < minRatingFilter) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStore, statusFilter, minRatingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = () => {
    const pageIds = paginatedProducts.map(p => p.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBulkArchive = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      title: 'Move to Archive / Trash',
      message: `Are you sure you want to move ${selectedIds.size} selected product(s) to Archive?`,
      count: selectedIds.size,
      confirmLabel: 'Move to Archive',
      confirmColor: 'var(--ink)',
      onConfirm: async () => {
        for (const id of selectedIds) {
          await onUpdateProduct?.(id, { status: 'archived' });
        }
        setSelectedIds(new Set());
        setConfirmModal(null);
      }
    });
  };

  const handleBulkRestore = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      title: 'Restore to Live Store',
      message: `Restore ${selectedIds.size} product(s) back to Live Storefront?`,
      count: selectedIds.size,
      confirmLabel: 'Restore to Live',
      confirmColor: 'var(--green-deep)',
      onConfirm: async () => {
        for (const id of selectedIds) {
          await onUpdateProduct?.(id, { status: 'published' });
        }
        setSelectedIds(new Set());
        setConfirmModal(null);
      }
    });
  };

  const handleBulkPermanentDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      title: '⚠️ Permanent Delete Confirmation',
      message: `Are you sure you want to permanently delete ${selectedIds.size} product(s)?`,
      count: selectedIds.size,
      confirmLabel: 'Delete Permanently',
      confirmColor: '#dc2626',
      onConfirm: async () => {
        const idList = Array.from(selectedIds);
        if (onBulkDeleteProducts) {
          await onBulkDeleteProducts(idList);
        } else {
          for (const id of idList) {
            await onDeleteProduct?.(id);
          }
        }
        setSelectedIds(new Set());
        setConfirmModal(null);
      }
    });
  };

  const handleBulkChangeCategory = async () => {
    if (selectedIds.size === 0) return;
    const idList = Array.from(selectedIds);
    if (onBulkUpdateProducts) {
      const updates = idList.map(id => ({ id, patch: { category: bulkCategoryTarget } }));
      await onBulkUpdateProducts(updates);
    } else {
      for (const id of idList) {
        await onUpdateProduct?.(id, { category: bulkCategoryTarget });
      }
    }
    setSelectedIds(new Set());
  };

  const copyAffiliate = (id, url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setImportNotice('CSV is empty or invalid format.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
        let updatedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          const row = {};
          headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });

          const extId = row.ext_id || row.product_id || row.p_id || '';
          const affUrl = row.affiliate_url || row.link || '';

          if (extId && affUrl) {
            const matched = products.find(p => (p.ext_id && String(p.ext_id).toLowerCase() === extId.toLowerCase()) || (p.id && String(p.id).toLowerCase().includes(extId.toLowerCase())));
            if (matched) {
              await onUpdateProduct?.(matched.id, { affiliateUrl: affUrl });
              updatedCount++;
            }
          }
        }

        setImportNotice(`✨ Successfully matched and updated ${updatedCount} products by exact Meesho Product ID!`);
        setTimeout(() => setImportNotice(''), 6000);
      } catch (err) {
        setImportNotice('Error parsing CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const items = filteredProducts.length ? filteredProducts : products;
    if (!items.length) return;

    const rows = [
      ["ID", "Ext ID", "Title", "Category", "Store", "Price", "Rating", "Image URL", "Product URL", "Affiliate URL", "Status"]
    ];

    items.forEach((p) => {
      rows.push([
        `"${p.id || ''}"`,
        `"${p.ext_id || ''}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${p.category || 'Tops & Tunics'}"`,
        `"${p.store || 'Meesho'}"`,
        `"₹${p.price || 0}"`,
        `"${p.rating || 4.3}"`,
        `"${p.image || ''}"`,
        `"${p.productUrl || ''}"`,
        `"${p.affiliateUrl || ''}"`,
        `"${p.status || 'published'}"`
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `catalog_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-catalog-view p-6 bg-gray-950 text-white min-h-screen">
       <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
         <div>
           <h1 className="text-3xl font-bold flex items-center gap-3">
             <span className="text-blue-500">📦</span> Master Catalog Control
           </h1>
           <span className="text-sm text-gray-400 mt-2 block">
             {products.length} Products in Database
           </span>
         </div>

         <div className="flex gap-4">
           <input type="file" ref={fileInputRef} onChange={handleCSVUpload} accept=".csv" className="hidden"/>
           <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
             <Icon name="download" size={15} /> Batch Import
           </button>
           <button onClick={onOpenAddProduct} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
             <Icon name="plus" size={15} /> Add Product
           </button>
         </div>
      </div>

       {importNotice && <div className="bg-green-900/30 border border-green-700 text-green-300 p-4 rounded-lg mb-6">{importNotice}</div>}

       <div className="flex flex-wrap gap-3 mb-8">
         {['All', 'Live', 'Drafts', 'Archive', 'Missing Link', 'AI Flagged'].map((tab) => (
           <button 
             key={tab}
             onClick={() => { setStatusFilter(tab.toLowerCase().replace(' ', '_')); setPage(1); }}
             className={`px-4 py-2 rounded-full border ${statusFilter === tab.toLowerCase().replace(' ', '_') ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
           >
             {tab}
           </button>
         ))}
       </div>

       <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-gray-950 border-b border-gray-800">
               <tr>
                 <th className="p-4">Product</th>
                 <th className="p-4">Category</th>
                 <th className="p-4">Price</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
               {paginatedProducts.map((p) => (
                 <tr key={p.id} className="hover:bg-gray-800/50 transition">
                   <td className="p-4 flex items-center gap-4">
                     <img src={p.image || '/placeholder.jpg'} alt={p.title} className="w-16 h-16 rounded object-cover"/>
                     <div>
                       <div className="font-semibold">{p.title}</div>
                       <div className="text-xs text-gray-500">{p.id}</div>
                     </div>
                   </td>
                   <td className="p-4"><span className="px-2 py-1 bg-gray-800 rounded text-xs">{p.category || 'N/A'}</span></td>
                   <td className="p-4 font-mono">{money(p.price)}</td>
                   <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${p.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{p.status}</span></td>
                   <td className="p-4 text-right">
                     <button onClick={() => onOpenEditProduct(p)} className="text-blue-400 hover:text-blue-300">Edit</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>

       {confirmModal && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
           <div className="bg-gray-900 p-8 rounded-xl max-w-sm w-full border border-gray-700">
             <h3 className="text-xl mb-4">{confirmModal.title}</h3>
             <p className="text-gray-400 mb-6">{confirmModal.message}</p>
             <div className="flex gap-4">
               <button className="flex-1 py-2 bg-gray-800 rounded" onClick={() => setConfirmModal(null)}>Cancel</button>
               <button className="flex-1 py-2 bg-red-600 rounded" onClick={confirmModal.onConfirm}>Confirm</button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

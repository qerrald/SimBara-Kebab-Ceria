/* SimBaRa Admin - interaksi front-end */
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  document.querySelectorAll('[data-sidebar-toggle], .mobile-toggle').forEach(button => {
    button.addEventListener('click', () => sidebar?.classList.toggle('show'));
  });
  document.addEventListener('click', event => {
    if (window.innerWidth <= 991 && sidebar?.classList.contains('show') &&
        !sidebar.contains(event.target) && !event.target.closest('[data-sidebar-toggle], .mobile-toggle')) {
      sidebar.classList.remove('show');
    }
  });

  // Toast feedback untuk aksi demo seperti menyimpan pengaturan dan export.
  const toastHost = document.createElement('div');
  toastHost.className = 'toast-container position-fixed bottom-0 end-0 p-3';
  toastHost.style.zIndex = '2000';
  toastHost.innerHTML = '<div id="appToast" class="toast border-0 shadow" role="status"><div class="d-flex"><div class="toast-body">Berhasil.</div><button type="button" class="btn-close me-3 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button></div></div>';
  document.body.appendChild(toastHost);
  const notify = message => {
    const el = document.getElementById('appToast');
    el.querySelector('.toast-body').textContent = message;
    if (window.bootstrap?.Toast) bootstrap.Toast.getOrCreateInstance(el, { delay: 2600 }).show();
    else window.alert(message);
  };
  document.querySelectorAll('.btn-brand').forEach(button => {
    const label = button.textContent.trim().toLowerCase();
    if (/simpan|export|mengerti|tutup/.test(label) && button.type !== 'submit' && !button.closest('form')) {
      button.addEventListener('click', event => {
        if (button.tagName === 'A') return;
        event.preventDefault();
        notify(label.includes('export') ? 'Demo: laporan siap diekspor setelah backend dihubungkan.' : 'Aksi demo berhasil dijalankan. Data belum disimpan ke server.');
      });
    }
  });

  // Kalkulasi ringkasan pesanan berdasarkan jumlah produk.
  const orderForm = document.querySelector('[data-order-form]');
  if (orderForm) {
    const quantities = [...orderForm.querySelectorAll('[data-product-qty]')];
    const subtotalTarget = document.querySelector('[data-order-subtotal]');
    const totalTarget = document.querySelector('[data-order-total]');
    const detailTarget = document.querySelector('[data-order-detail]');
    const rupiah = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    const calculate = () => {
      let total = 0;
      const details = [];
      quantities.forEach(input => {
        const qty = Math.max(0, Number(input.value) || 0);
        const price = Number(input.dataset.price) || 0;
        const name = input.dataset.name || 'Produk';
        if (qty > 0) { total += qty * price; details.push(`${name} × ${qty}`); }
      });
      if (subtotalTarget) subtotalTarget.textContent = rupiah(total);
      if (totalTarget) totalTarget.textContent = rupiah(total);
      if (detailTarget) detailTarget.textContent = details.join(', ') || 'Belum ada produk dipilih';
      return total;
    };
    quantities.forEach(input => input.addEventListener('input', calculate));
    calculate();
    orderForm.addEventListener('submit', () => {
      const customer = orderForm.querySelector('[data-customer-name]')?.value || 'Pelanggan';
      sessionStorage.setItem('simbarLastOrder', JSON.stringify({ customer, total: calculate(), details: detailTarget?.textContent || '' }));
    });
  }

  // Isi halaman konfirmasi dari data form terakhir (jika tersedia).
  const successData = document.querySelector('[data-success-order]');
  if (successData) {
    try {
      const order = JSON.parse(sessionStorage.getItem('simbarLastOrder') || 'null');
      if (order) {
        const customer = successData.querySelector('[data-success-customer]');
        const total = successData.querySelector('[data-success-total]');
        const detail = successData.querySelector('[data-success-detail]');
        if (customer) customer.textContent = order.customer;
        if (total) total.textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total);
        if (detail) detail.textContent = order.details;
      }
    } catch (_) { /* Abaikan data sesi yang tidak valid. */ }
  }
});

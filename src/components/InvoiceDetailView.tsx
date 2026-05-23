/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useGarage } from '../context/GarageContext';
import { Wrench, ArrowLeft, ShieldCheck, Download, Calendar, Mail, FileText, CheckCircle, Car } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const InvoiceDetailView: React.FC = () => {
  const { bills, selectedBillId, setSelectedBillId, users } = useGarage();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const bill = bills.find(b => b.id === selectedBillId);

  if (!bill) {
    return (
      <div className="p-8 text-center text-[#74777d]">
        <p>No invoice selected. Return to dashboard.</p>
        <button 
          onClick={() => setSelectedBillId(null)}
          className="mt-4 px-4 py-2 bg-[#041627] text-white rounded"
        >
          Return Home
        </button>
      </div>
    );
  }

  const adminUser = users.find(u => u.isAdmin);
  const garageAddress = adminUser?.address || 'Plot 402, Phase III, Industrial Area, Sector 20, Gurugram, HR';
  const garageGstin = adminUser?.gstin || '07AAGCC8114K1Z1';
  const garagePhone = adminUser?.phone ? (adminUser.phone.startsWith('+91') || adminUser.phone.startsWith('091') ? adminUser.phone : `+91 ${adminUser.phone}`) : '+91 98765 43210';
  const garageEmail = adminUser?.email || 'alex.miller@cityautogarage.com';

  const handleBack = () => {
    setSelectedBillId(null);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');

      // Draw primary header band
      doc.setFillColor(4, 22, 39); // Deep blue theme (#041627)
      doc.rect(0, 0, 210, 15, 'F');

      // Red Accent Band
      doc.setFillColor(182, 23, 30); // Theme red (#b6171e)
      doc.rect(0, 15, 210, 2, 'F');

      // Title & Contact Info
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(4, 22, 39);
      doc.text('CITY AUTO GARAGE', 14, 32);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 83, 88);
      doc.text(garageAddress, 14, 38);
      doc.text(`GSTIN: ${garageGstin} | Phone: ${garagePhone}`, 14, 43);
      doc.text(`Email: ${garageEmail}`, 14, 48);

      // Tax Invoice Title Block
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(182, 23, 30);
      doc.text('TAX INVOICE', 142, 32);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(4, 22, 39);
      doc.text(`INVOICE ID: ${bill.id}`, 142, 38);
      doc.text(`DATE: ${bill.date}`, 142, 43);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(16, 124, 65); // Paid badge green
      doc.text('STATUS: PAID', 142, 48);

      // Line Divider
      doc.setDrawColor(210, 214, 219);
      doc.setLineWidth(0.5);
      doc.line(14, 54, 196, 54);

      // Client Details
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(116, 119, 125);
      doc.text('PARTY NAME / BILLED TO:', 14, 62);
      doc.setFontSize(12);
      doc.setTextColor(4, 22, 39);
      doc.text(bill.customerName, 14, 69);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Email: ${bill.customerEmail}`, 14, 75);
      doc.text(`Phone: +91 ${bill.customerPhone}`, 14, 80);

      // Vehicle Details
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(116, 119, 125);
      doc.text('VEHICLE & INFORMATION:', 110, 62);
      doc.setFontSize(12);
      doc.setTextColor(4, 22, 39);
      doc.text(bill.vehicleDetails.makeModel, 110, 69);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Plate: ${bill.vehicleDetails.plateNumber.toUpperCase()}`, 110, 75);

      // Table Header bg
      doc.setFillColor(245, 243, 244);
      doc.rect(14, 90, 182, 8, 'F');

      // Table Headers
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(116, 119, 125);
      doc.text('#', 16, 95);
      doc.text('Item Description', 25, 95);
      doc.text('Category', 95, 95);
      doc.text('Qty', 130, 95);
      doc.text('Rate', 152, 95);
      doc.text('Total', 178, 95);

      // Table rows
      let startY = 104;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(27, 28, 29);

      bill.items.forEach((item, index) => {
        if (startY > 260) {
          doc.addPage();
          startY = 20;
        }

        doc.text((index + 1).toString(), 16, startY);
        doc.setFont('Helvetica', 'bold');
        doc.text(item.name, 25, startY);
        doc.setFont('Helvetica', 'normal');
        doc.text(item.category, 95, startY);
        doc.text(item.qty.toString(), 130, startY);
        doc.text(`Rs. ${item.rate.toLocaleString('en-IN')}`, 152, startY);
        doc.text(`Rs. ${item.total.toLocaleString('en-IN')}`, 178, startY);

        doc.setDrawColor(240, 240, 240);
        doc.line(14, startY + 3, 196, startY + 3);
        startY += 8;
      });

      if (startY > 220) {
        doc.addPage();
        startY = 20;
      }

      const subTotal = bill.grandTotal / 1.18;
      const gstTax = bill.grandTotal - subTotal;

      doc.setDrawColor(210, 214, 219);
      doc.line(14, startY + 4, 196, startY + 4);
      startY += 10;

      // Terms
      doc.setFontSize(8);
      doc.setTextColor(116, 119, 125);
      doc.text('TERMS & JURISDICTIONS:', 14, startY);
      doc.text('1. Vehicles left entirely at owners risk.', 14, startY + 5);
      doc.text('2. Warranty covers parts under manufacturer clause.', 14, startY + 10);
      doc.text('3. Subject to Gurugram administrative jurisdiction only.', 14, startY + 15);

      // Totals
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 83, 88);
      doc.text('Parts & Labour Subtotal:', 110, startY);
      doc.text(`Rs. ${subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 170, startY);

      doc.text('GST TAX INCLUSIVE (18%):', 110, startY + 5);
      doc.text(`Rs. ${gstTax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 170, startY + 5);

      doc.setDrawColor(4, 22, 39);
      doc.setLineWidth(0.5);
      doc.line(110, startY + 10, 196, startY + 10);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(4, 22, 39);
      doc.text('GRAND TOTAL:', 110, startY + 16);
      doc.text(`Rs. ${bill.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 170, startY + 16);

      if (bill.notes) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(182, 23, 30);
        doc.text(`REMARK: ${bill.notes}`, 14, startY + 23);
      }

      startY += 35;
      doc.setDrawColor(200, 204, 208);
      doc.line(14, startY, 80, startY);
      doc.line(120, startY, 186, startY);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(4, 22, 39);
      doc.text('Alex Miller', 14, startY + 5);
      doc.text(bill.customerName, 120, startY + 5);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(116, 119, 125);
      doc.text('GARAGE CONTROLLER', 14, startY + 9);
      doc.text('CUSTOMER RECIPIENT', 120, startY + 9);

      doc.save(`Invoice_${bill.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  // Tax calculations
  const subTotal = bill.grandTotal / 1.18;
  const gstTax = bill.grandTotal - subTotal;

  // Currencies formatting based on amount sizes
  const formatCurrency = (amt: number) => {
    return `₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Formulate shareable WhatsApp text
  const partsLabel = bill.items.map((item, idx) => 
    `• ${idx+1}. ${item.name} (${item.qty}) - Rs. ${item.total.toLocaleString('en-IN')}`
  ).join('\n');

  const text = `*CITY AUTO GARAGE - TAX INVOICE*\n` +
    `----------------------------------\n` +
    `*Invoice ID:* ${bill.id}\n` +
    `*Date:* ${bill.date}\n` +
    `*Customer:* ${bill.customerName}\n` +
    `*Phone:* +91 ${bill.customerPhone}\n` +
    `*Vehicle:* ${bill.vehicleDetails.makeModel} [${bill.vehicleDetails.plateNumber.toUpperCase()}]\n` +
    `----------------------------------\n` +
    `*Services & Repairs:*\n${partsLabel}\n` +
    `----------------------------------\n` +
    `*Grand Total:* Rs. ${bill.grandTotal.toLocaleString('en-IN')}\n` +
    `*Status:* PAID ✓\n\n` +
    `Thank you for choosing City Auto Garage! Feel free to reach out to us at +91 98765 43210.`;

  const cleanPhone = bill.customerPhone.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`;

  return (
    <div className="bg-[#fbf9fa] text-[#1b1c1d] min-h-screen py-10 px-4 md:px-8 font-body print:p-0 print:bg-white select-none">
      
      {/* Invoice Actions Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden border-b border-[#cbd5e1]/45 pb-4">
        <button 
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#efedef] hover:bg-[#e9e7e9] text-[#041627] font-headline text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back
        </button>

        <div className="flex gap-2.5 items-center">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#041627] text-white hover:bg-[#1a2b3c] font-headline text-xs font-bold uppercase tracking-wider transition-all shadow-3xs cursor-pointer select-none"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>

          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] font-headline text-xs font-bold uppercase tracking-wider transition-all shadow-3xs cursor-pointer select-none"
          >
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Bill
          </a>
        </div>
      </div>

      {/* Main Invoice Sheet Area */}
      <div 
        ref={printAreaRef}
        className="max-w-3xl mx-auto bg-white border border-[#c4c6cd]/60 rounded-xl p-8 md:p-12 shadow-[0_4px_30px_rgba(4,22,39,0.03)] relative overflow-hidden print:border-none print:shadow-none print:p-0"
      >
        {/* Subtle background print watermarks / headers */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#b6171e] to-[#041627] print:hidden"></div>

        {/* TOP COMPONENT HEADER BLOCK */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#cbd5e1]/65 pb-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 select-none">
              <span className="p-2 bg-[#041627] text-white rounded-lg">
                <Wrench className="h-5 w-5 stroke-[2]" />
              </span>
              <span className="font-headline text-lg font-bold text-[#041627] tracking-tight">CITY AUTO GARAGE</span>
            </div>
            <p className="text-xs text-[#44474c] font-medium leading-normal max-w-xs">
              {garageAddress}<br />
              <span className="font-semibold block mt-1.5">GSTIN: {garageGstin}</span>
              <span>Phone: {garagePhone} | {garageEmail}</span>
            </p>
          </div>

          <div className="text-left md:text-right space-y-2">
            <p className="font-headline text-3xl font-extrabold text-[#041627] tracking-tight uppercase leading-none print:text-2xl">Tax Invoice</p>
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold tracking-widest uppercase rounded border border-emerald-300 shadow-3xs print:border-none">
              ✓ Paid
            </div>
            <div className="text-xs text-[#44474c] font-semibold space-y-1.5 pt-2">
              <p><span className="text-[#74777d]">INVOICE ID: </span><span className="font-mono text-[#041627] font-bold">{bill.id}</span></p>
              <p><span className="text-[#74777d]">DATE: </span><span>{bill.date}</span></p>
            </div>
          </div>
        </section>

        {/* PARTY DETAILS METADATA ROW */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-[#cbd5e1]/65 mb-8">
          <div>
            <p className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider mb-2">PARTY NAME / BILLED TO</p>
            <div className="space-y-1 text-xs">
              <h4 className="font-headline text-base font-extrabold text-[#041627]">{bill.customerName}</h4>
              <p className="text-[#44474c] font-semibold">{bill.customerEmail}</p>
              <p className="text-[#44474c] font-semibold">+91 {bill.customerPhone}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider mb-2">VEHICLE DETAILS / ODOMETER</p>
            <div className="space-y-1 text-xs">
              <h4 className="font-headline text-base font-extrabold text-[#041627] flex items-center gap-1">
                <Car className="h-4.5 w-4.5" />
                {bill.vehicleDetails.makeModel}
              </h4>
              <p className="text-[#44474c] font-semibold flex items-center gap-1.5">
                <span className="text-[#74777d]">PLATE: </span>
                <span className="font-mono uppercase font-bold tracking-wider">{bill.vehicleDetails.plateNumber}</span>
              </p>
              <p className="text-[#44474c] font-semibold">
                <span className="text-[#74777d]">ODOMETER: </span>
                <span>{bill.vehicleDetails.odometer.toLocaleString()} KM</span>
              </p>
            </div>
          </div>
        </section>

        {/* ITEMIZED DATA TABLE */}
        <section className="mb-8">
          <p className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider mb-3">Service &amp; Repair Itemization</p>
          <div className="border border-[#c4c6cd]/50 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f3f4]/70 border-b border-[#cbd5e1]/45 font-headline font-bold text-[10px] text-[#74777d] uppercase tracking-wider select-none">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Category</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbd5e1]/40 font-body text-[#1b1c1d] leading-normal font-semibold">
                {bill.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#fbf9fa]/30">
                    <td className="p-3 text-center text-[#74777d]">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-headline font-bold text-[#041627] block">{item.name}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 text-[8px] font-bold bg-[#efedef] text-[#041627] border border-[#cbd5e1]/50 rounded font-headline uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">{item.qty}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(item.rate)}</td>
                    <td className="p-3 text-right font-mono text-[#041627] font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* INVOICE TOTALS BREAKDOWN AND TERMS */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
          
          {/* Notes and terms left box */}
          <div className="md:col-span-7 bg-[#f5f3f4]/30 border border-[#c4c6cd]/50 rounded-lg p-4 space-y-4">
            <div>
              <p className="text-[9px] font-bold text-[#041627] uppercase tracking-wider mb-2">TERMS &amp; JURISDICTIONS</p>
              <ul className="text-[10px] text-[#44474c] space-y-1.5 list-decimal pl-3.5 leading-relaxed font-semibold">
                <li>Vehicles are left in our station entirely at owner's risk parameter.</li>
                <li>Parts warranty holds under standard manufacturer clauses.</li>
                <li>Interest @ 18% charged if payment is unfulfilled.</li>
                <li>Subject to Gurugram administrative jurisdiction only.</li>
              </ul>
            </div>
            
            {bill.notes && (
              <div className="border-t border-[#c4c6cd]/40 pt-3">
                <p className="text-[9px] font-bold text-[#b6171e] uppercase tracking-wider">REMARK RECOMMENDATION</p>
                <p className="text-[11px] text-[#44474c] mt-1 italic font-medium leading-normal">{bill.notes}</p>
              </div>
            )}
          </div>

          {/* Totals table right box */}
          <div className="md:col-span-5 space-y-3 pt-2 text-xs text-[#44474c] font-semibold leading-relaxed leading-none">
            <div className="flex justify-between">
              <span>Parts &amp; Labour Subtotal</span>
              <span className="font-mono text-sm text-[#1b1c1d]">{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST TAX INCLUSIVE (18%)</span>
              <span className="font-mono text-sm text-[#1b1c1d]">{formatCurrency(gstTax)}</span>
            </div>
            
            {/* Grand Total banner box */}
            <div className="border-t-2 border-dashed border-[#c4c6cd] pt-4 flex justify-between items-center font-headline font-extrabold text-[#041627]">
              <span className="text-xs uppercase tracking-wider">GRAND TOTAL</span>
              <span className="text-xl font-mono tracking-tight">{formatCurrency(bill.grandTotal)}</span>
            </div>
          </div>

        </section>

        {/* SIGNATURE FIELDS FOR AUDITING */}
        <section className="mt-16 pt-12 border-t border-dashed border-[#c4c6cd] grid grid-cols-2 gap-10 text-center text-xs select-none">
          <div className="space-y-6">
            <p className="font-mono text-[10px] uppercase font-bold text-[#74777d] tracking-widest leading-none">Cages Audits / Authorized Sign</p>
            <div className="border-t border-[#cbd5e1] max-w-[200px] mx-auto pt-2">
              <p className="font-headline font-bold text-[#041627] mt-1">Alex Miller</p>
              <p className="text-[10px] text-[#74777d] mt-0.5">GARAGE CONTROLLER</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-mono text-[10px] uppercase font-bold text-[#74777d] tracking-widest leading-none">Recipient Approvals Sign</p>
            <div className="border-t border-[#cbd5e1] max-w-[200px] mx-auto pt-2">
              <p className="font-headline font-bold text-[#041627] mt-1">{bill.customerName}</p>
              <p className="text-[10px] text-[#74777d] mt-0.5">CUSTOMER RECIPIENT</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

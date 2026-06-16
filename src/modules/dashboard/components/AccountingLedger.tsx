"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  Calculator,
  BookOpen,
  Clock,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

export function AccountingLedger({
  initialEntries = [],
}: {
  initialEntries?: any[];
}) {
  const [entries, setEntries] = useState<any[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    debitAccount: "",
    debitAmount: "",
    creditAccount: "",
    creditAmount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.debitAmount !== formData.creditAmount) {
      alert("Debits must equal credits.");
      return;
    }

    // Post to the command gateway for new journal entry (we will add a command type for this or an API)
    const res = await fetch("/api/command-gateway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "POST_JOURNAL_ENTRY",
        payload: {
          description: formData.description,
          lines: [
            {
              accountCode: formData.debitAccount,
              direction: "debit",
              amount: parseFloat(formData.debitAmount),
            },
            {
              accountCode: formData.creditAccount,
              direction: "credit",
              amount: parseFloat(formData.creditAmount),
            },
          ],
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setEntries([data.data, ...entries]);
      setShowForm(false);
      setFormData({
        description: "",
        debitAccount: "",
        debitAmount: "",
        creditAccount: "",
        creditAmount: "",
      });
      window.location.reload();
    } else {
      alert("Failed to save entry");
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 bg-transparent text-white pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 relative z-10 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-[#D4A64F] uppercase font-bold tracking-widest flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>General Ledger Active</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Accounting Ledger
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-[#D4A64F] animate-[ping_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(212,166,79,0.6)]" />
            Oracle ERP Logic • Comptabilité Générale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(212,166,79,0.3)] transition-all active:scale-95 border border-transparent outline-none"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
        >
          <h3 className="text-lg font-bold mb-4 font-display text-white">
            Post Journal Entry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-[#D4A64F] font-bold mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                placeholder="Entry Description"
              />
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-gray-300">Debit Line</h4>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">
                  Account Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.debitAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, debitAccount: e.target.value })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                  placeholder="e.g. 512"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.debitAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, debitAmount: e.target.value })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-gray-300">Credit Line</h4>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">
                  Account Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.creditAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, creditAccount: e.target.value })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                  placeholder="e.g. 411"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.creditAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, creditAmount: e.target.value })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
            >
              Submit Entry
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center relative py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-white/30" />
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2 tracking-tight">
            No Journal Entries
          </h2>
          <p className="text-xs font-medium text-white/50 leading-relaxed mb-8 max-w-sm text-center">
            The general ledger is currently empty. Post a new entry to
            synchronize Oracle ERP logic.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg font-display">
                    {entry.description || "Journal Entry"}
                  </h3>
                  <div className="flex gap-4 mt-2 text-xs text-white/50 font-mono">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {entry.referenceCode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {format(new Date(entry.entryDate), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-mono text-[10px] uppercase font-bold tracking-wider">
                  {entry.status}
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-widest text-[#D4A64F]">
                      <th className="pb-2 font-bold">Account</th>
                      <th className="pb-2 font-bold text-right">Debit</th>
                      <th className="pb-2 font-bold text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {entry.lines?.map((line: any, i: number) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-2 text-white/80">
                          {line.account?.code} - {line.account?.name}
                        </td>
                        <td className="py-2 text-right text-gray-300">
                          {line.direction === "debit"
                            ? Number(line.amount).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })
                            : "-"}
                        </td>
                        <td className="py-2 text-right text-gray-300">
                          {line.direction === "credit"
                            ? Number(line.amount).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

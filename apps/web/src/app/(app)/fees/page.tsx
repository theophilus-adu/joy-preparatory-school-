'use client'

import { AlertTriangle, CheckCircle2, Download, Plus, Printer, Search, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Logo } from '@/components/logo'
import { Badge, Button, Card, EmptyState, Field, Modal, PageHeader, StatCard } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { Payment, PaymentMethod } from '@/lib/types'
import { downloadCSV, formatDate, formatGHS, invoicePaid, invoiceStatus, todayISO } from '@/lib/utils'

const STATUS_TONE = { paid: 'green', partial: 'amber', unpaid: 'gray', overdue: 'red' } as const
const METHODS: PaymentMethod[] = ['Mobile Money', 'Cash', 'Bank Transfer']

export default function FeesPage() {
  const { data, recordPayment } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [classId, setClassId] = useState('')
  const [payFor, setPayFor] = useState<string | null>(null) // invoice id, or '' for picker
  const [receipt, setReceipt] = useState<(Omit<Payment, 'id'> & { invoiceNo: string; studentName: string; balance: number }) | null>(null)

  const studentById = useMemo(() => new Map(data.students.map((s) => [s.id, s])), [data.students])
  const classById = useMemo(() => new Map(data.classes.map((c) => [c.id, c])), [data.classes])

  const rows = useMemo(
    () =>
      data.invoices.map((inv) => {
        const paid = invoicePaid(inv, data.payments)
        return { inv, student: studentById.get(inv.studentId)!, paid, balance: Math.max(0, inv.amount - paid), status: invoiceStatus(inv, data.payments) }
      }),
    [data.invoices, data.payments, studentById],
  )

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('status')) setStatus(p.get('status')!)
    const sid = p.get('student')
    if (sid) {
      const owing = rows.find((r) => r.student.id === sid && r.balance > 0)
      if (owing) setPayFor(owing.inv.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = rows
    .filter((r) => !classId || r.student.classId === classId)
    .filter((r) => !status || (status === 'owing' ? r.balance > 0 : r.status === status))
    .filter((r) => {
      const q = query.trim().toLowerCase()
      return !q || `${r.student.firstName} ${r.student.lastName} ${r.student.studentId} ${r.inv.invoiceNo}`.toLowerCase().includes(q)
    })
    .sort((a, b) => b.balance - a.balance || a.student.lastName.localeCompare(b.student.lastName))

  const billed = rows.reduce((s, r) => s + r.inv.amount, 0)
  const collected = rows.reduce((s, r) => s + Math.min(r.paid, r.inv.amount), 0)
  const outstanding = billed - collected
  const overdue = rows.filter((r) => r.status === 'overdue')

  const exportCSV = () =>
    downloadCSV('fees.csv', [
      ['Invoice', 'Student ID', 'Student', 'Class', 'Amount', 'Paid', 'Balance', 'Status', 'Guardian phone'],
      ...filtered.map((r) => [r.inv.invoiceNo, r.student.studentId, `${r.student.firstName} ${r.student.lastName}`, classById.get(r.student.classId)?.name ?? '', r.inv.amount, r.paid, r.balance, r.status, r.student.guardianPhone]),
    ])

  return (
    <>
      <PageHeader
        title="Fees & Payments"
        description={`${data.school.currentTerm}, ${data.school.academicYear}`}
        actions={
          <>
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setPayFor('')}>
              <Plus className="h-4 w-4" /> Record payment
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total billed" value={formatGHS(billed)} hint={`${rows.length} invoices`} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Collected" value={formatGHS(collected)} hint={`${Math.round((collected / Math.max(billed, 1)) * 100)}% collection rate`} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard label="Outstanding" value={formatGHS(outstanding)} hint={`${rows.filter((r) => r.balance > 0).length} students owing`} icon={<Wallet className="h-5 w-5" />} tone="amber" />
        <StatCard label="Overdue" value={overdue.length} hint={formatGHS(overdue.reduce((s, r) => s + r.balance, 0))} icon={<AlertTriangle className="h-5 w-5" />} tone="red" />
      </div>

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search student or invoice no…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="input lg:w-40" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">All classes</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="input lg:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="owing">Owing (any)</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Part-paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Wallet className="h-6 w-6" />} title="No invoices match" />
        ) : (
          <div className="max-h-[640px] overflow-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="th">Student</th>
                  <th className="th hidden md:table-cell">Invoice</th>
                  <th className="th text-right">Amount</th>
                  <th className="th hidden text-right sm:table-cell">Paid</th>
                  <th className="th text-right">Balance</th>
                  <th className="th">Status</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.inv.id} className="hover:bg-slate-50">
                    <td className="td">
                      <Link href={`/students/${r.student.id}`} className="font-medium text-slate-900 hover:underline hover:decoration-gold-400 hover:decoration-2 hover:underline-offset-4">
                        {r.student.firstName} {r.student.lastName}
                      </Link>
                      <p className="text-xs text-slate-500">{classById.get(r.student.classId)?.name}</p>
                    </td>
                    <td className="td hidden md:table-cell">
                      <p>{r.inv.invoiceNo}</p>
                      <p className="text-xs text-slate-500">Due {formatDate(r.inv.dueDate)}</p>
                    </td>
                    <td className="td text-right tabular-nums">{formatGHS(r.inv.amount)}</td>
                    <td className="td hidden text-right tabular-nums sm:table-cell">{formatGHS(r.paid)}</td>
                    <td className="td text-right font-semibold tabular-nums text-slate-900">{formatGHS(r.balance)}</td>
                    <td className="td">
                      <Badge tone={STATUS_TONE[r.status]} className="capitalize">
                        {r.status === 'partial' ? 'Part-paid' : r.status}
                      </Badge>
                    </td>
                    <td className="td text-right">
                      {r.balance > 0 && (
                        <Button size="sm" variant="secondary" onClick={() => setPayFor(r.inv.id)}>
                          Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {payFor !== null && (
        <PaymentModal
          initialInvoiceId={payFor}
          rows={rows}
          onClose={() => setPayFor(null)}
          onSave={(p) => {
            recordPayment(p)
            const r = rows.find((x) => x.inv.id === p.invoiceId)!
            setPayFor(null)
            setReceipt({ ...p, invoiceNo: r.inv.invoiceNo, studentName: `${r.student.firstName} ${r.student.lastName}`, balance: Math.max(0, r.balance - p.amount) })
          }}
        />
      )}

      {receipt && (
        <Modal
          open
          onClose={() => setReceipt(null)}
          title="Payment recorded"
          footer={
            <>
              <Button variant="secondary" onClick={() => setReceipt(null)}>
                Done
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print receipt
              </Button>
            </>
          }
        >
          <div id="receipt" className="rounded-lg border border-slate-200 p-5 text-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
              <Logo className="h-10 w-10" />
              <div>
                <p className="font-semibold text-slate-900">{data.school.name}</p>
                <p className="text-xs text-slate-500">Official receipt</p>
              </div>
            </div>
            <dl className="space-y-2">
              {[
                ['Received from', receipt.studentName],
                ['Invoice', receipt.invoiceNo],
                ['Date', formatDate(receipt.date)],
                ['Method', receipt.method],
                ['Reference', receipt.reference || '—'],
                ['Amount', formatGHS(receipt.amount)],
                ['Balance remaining', formatGHS(receipt.balance)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Modal>
      )}
    </>
  )
}

function PaymentModal({
  initialInvoiceId,
  rows,
  onClose,
  onSave,
}: {
  initialInvoiceId: string
  rows: { inv: { id: string; invoiceNo: string; amount: number }; student: { firstName: string; lastName: string; studentId: string }; balance: number }[]
  onClose: () => void
  onSave: (p: Omit<Payment, 'id'>) => void
}) {
  const owing = rows.filter((r) => r.balance > 0).sort((a, b) => a.student.lastName.localeCompare(b.student.lastName))
  const [invoiceId, setInvoiceId] = useState(initialInvoiceId || owing[0]?.inv.id || '')
  const current = rows.find((r) => r.inv.id === invoiceId)
  const [amount, setAmount] = useState(current ? String(current.balance) : '')
  const [method, setMethod] = useState<PaymentMethod>('Mobile Money')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!current) return setError('Choose an invoice.')
    if (!amt || amt <= 0) return setError('Enter an amount greater than zero.')
    if (amt > current.balance) return setError(`Amount is more than the balance of ${formatGHS(current.balance)}.`)
    if (method !== 'Cash' && !reference.trim()) return setError('Enter the transaction reference.')
    onSave({ invoiceId, amount: amt, method, reference: reference.trim(), date })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Record payment"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form">
            Save payment
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <Field label="Student / invoice">
          <select
            className="input"
            value={invoiceId}
            onChange={(e) => {
              setInvoiceId(e.target.value)
              const r = rows.find((x) => x.inv.id === e.target.value)
              setAmount(r ? String(r.balance) : '')
            }}
          >
            {owing.map((r) => (
              <option key={r.inv.id} value={r.inv.id}>
                {r.student.lastName}, {r.student.firstName} · {r.inv.invoiceNo} · owes {formatGHS(r.balance)}
              </option>
            ))}
          </select>
        </Field>
        {current && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Invoice {formatGHS(current.inv.amount)} · Balance <span className="font-semibold text-slate-900">{formatGHS(current.balance)}</span>
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (GHS)">
            <input className="input tabular-nums" inputMode="decimal" value={amount} onChange={(e) => /^\d*\.?\d{0,2}$/.test(e.target.value) && setAmount(e.target.value)} required />
          </Field>
          <Field label="Date">
            <input type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Method">
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label={method === 'Cash' ? 'Reference (optional)' : 'Transaction reference'}>
            <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={method === 'Mobile Money' ? 'MoMo transaction ID' : ''} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}

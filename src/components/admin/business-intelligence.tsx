
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';



interface BIData {
    name: string;
    revenue: number;
    students: number;
}

export const BusinessIntelligence = ({ data }: { data: BIData[] }) => {
    return (
        <div className="grid md:grid-cols-2 gap-6 h-[300px] mt-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Revenue Growth (BDT)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#ffffff20', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#ffffff20', fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#0070f3', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#ffffff40', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#0070f3" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Student Enrollment (Daily)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#ffffff20', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#ffffff20', fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#00d2ff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#ffffff40', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Line type="stepAfter" dataKey="students" stroke="#00d2ff" strokeWidth={3} dot={{ r: 4, fill: '#00d2ff', strokeWidth: 0 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

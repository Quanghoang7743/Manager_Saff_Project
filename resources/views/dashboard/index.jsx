import React from 'react'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    InputBase,
    Stack,
    Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import CakeRoundedIcon from '@mui/icons-material/CakeRounded'
import { useAuth } from '../../js/context/AuthContext.jsx'

const pipeline = [
    { label: 'Applied', value: 142, height: '40%' },
    { label: 'Screening', value: 86, height: '65%' },
    { label: 'Interview', value: 42, height: '35%' },
    { label: 'Offer', value: 12, height: '20%' },
    { label: 'Hired', value: 8, height: '15%' },
]

const activityRows = [
    {
        title: 'New Employee Onboarding',
        time: '2 HOURS AGO',
        text: 'James Wilson was added to the Product Design department.',
        icon: AddCircleRoundedIcon,
        bg: '#dbeafe',
        color: '#1d4ed8',
    },
    {
        title: 'Payroll Processed',
        time: '5 HOURS AGO',
        text: 'Monthly payroll for August 2024 has been successfully disbursed.',
        icon: DescriptionRoundedIcon,
        bg: '#dcfce7',
        color: '#166534',
    },
    {
        title: 'Leave Request Approved',
        time: 'YESTERDAY',
        text: "Sarah Chen's annual leave request (5 days) has been approved by Finance.",
        icon: HomeWorkRoundedIcon,
        bg: '#fee2e2',
        color: '#b91c1c',
    },
]

const birthdays = [
    { name: 'Eleanor Pena', meta: 'August 28 - TODAY' },
    { name: 'Guy Hawkins', meta: 'August 30 - 2 days left' },
    { name: 'Robert Fox', meta: 'Sept 02 - 5 days left' },
]

export default function DashboardPage() {

    return (
        <Box sx={{ p: { xs: 1.1, md: 2 } }}>
            <Card sx={{ boxShadow: '0 18px 44px rgba(15,23,42,0.08)', background:'transparent' }}>
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 5,
                        px: { xs: 1.2, md: 2.2 },
                        py: 1,
                        borderBottom: '1px solid #e2e8f0',
                        bgcolor: 'rgba(248,250,252,0.9)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.2}>
                        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: -0.3 }}>Dashboard Overview</Typography>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.8}
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    px: 1.2,
                                    py: 0.55,
                                    bgcolor: '#f8fafc',
                                }}
                            >
                                <SearchRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                <InputBase placeholder="Search employees, files..." sx={{ fontSize: 13, minWidth: 220 }} />
                            </Stack>
                        </Stack>


                    </Stack>
                </Box>

                <CardContent sx={{ p: { xs: 1.2, md: 2.2 } }}>
                    <Box sx={{ display: 'grid', gap: 1.1, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
                        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 12, color: '#64748b' }}>Total Employees</Typography>
                                <Typography sx={{ mt: 0.6, fontSize: 42, lineHeight: 1, fontWeight: 900, color: '#0f172a' }}>1,248</Typography>
                                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1 }}>
                                    <Box sx={{ px: 0.8, py: 0.2, bgcolor: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 700 }}>+12%</Box>
                                    <Typography sx={{ fontSize: 11, color: '#64748b' }}>vs last quarter</Typography>
                                </Stack>
                                <GroupsRoundedIcon sx={{ position: 'absolute', right: -10, bottom: -12, fontSize: 94, color: 'rgba(59,130,246,0.12)' }} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography sx={{ fontSize: 12, color: '#64748b' }}>On Leave Today</Typography>
                                <Typography sx={{ mt: 0.6, fontSize: 36, lineHeight: 1, fontWeight: 800, color: '#0f172a' }}>42</Typography>
                                <Stack direction="row" sx={{ mt: 1.1 }}>
                                    <Avatar sx={{ width: 26, height: 26, fontSize: 11 }}>E</Avatar>
                                    <Avatar sx={{ width: 26, height: 26, fontSize: 11, ml: -0.8 }}>G</Avatar>
                                    <Avatar sx={{ width: 26, height: 26, fontSize: 11, ml: -0.8 }}>R</Avatar>
                                    <Avatar sx={{ width: 26, height: 26, fontSize: 10, ml: -0.8, bgcolor: '#e2e8f0', color: '#334155' }}>+39</Avatar>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography sx={{ fontSize: 12, color: '#64748b' }}>New Hires</Typography>
                                <Typography sx={{ mt: 0.6, fontSize: 36, lineHeight: 1, fontWeight: 800, color: '#0f172a' }}>18</Typography>
                                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 1.1 }}>
                                    <VerifiedUserRoundedIcon sx={{ fontSize: 16, color: '#1d4ed8' }} />
                                    <Typography sx={{ fontSize: 12, color: '#64748b' }}>Onboarding in progress</Typography>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography sx={{ fontSize: 12, color: '#64748b' }}>Pending Requests</Typography>
                                <Typography sx={{ mt: 0.6, fontSize: 36, lineHeight: 1, fontWeight: 800, color: '#0f172a' }}>07</Typography>
                                <Button size="small" sx={{ mt: 1, textTransform: 'none', px: 0 }}>Review now</Button>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box sx={{ mt: 1.2, display: 'grid', gap: 1.1, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Hiring Pipeline</Typography>
                                        <Typography sx={{ fontSize: 12, color: '#64748b' }}>Candidate progression by stage</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={0.6}>
                                        <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>Weekly</Button>
                                        <Button size="small" variant="contained" sx={{ textTransform: 'none' }}>Monthly</Button>
                                    </Stack>
                                </Stack>

                                <Stack direction="row" alignItems="flex-end" spacing={1.5} sx={{ height: 210 }}>
                                    {pipeline.map((item, index) => (
                                        <Stack key={item.label} spacing={0.6} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: item.height,
                                                    borderRadius: '10px 10px 2px 2px',
                                                    bgcolor: index === 4 ? '#a5b4fc' : `rgba(37,99,235,${0.18 + index * 0.16})`,
                                                    position: 'relative',
                                                }}
                                            >
                                                <Typography sx={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#475569' }}>
                                                    {item.value}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Employee Diversity</Typography>
                                <Typography sx={{ fontSize: 12, color: '#64748b' }}>Gender balance overview</Typography>

                                <Box
                                    sx={{
                                        mt: 1.4,
                                        mx: 'auto',
                                        width: 170,
                                        height: 170,
                                        borderRadius: '50%',
                                        background: 'conic-gradient(#2563eb 0 45%, #a855f7 45% 80%, #22c55e 80% 100%)',
                                        display: 'grid',
                                        placeItems: 'center',
                                    }}
                                >
                                    <Box sx={{ width: 112, height: 112, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center' }}>
                                        <Typography sx={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Total</Typography>
                                        <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>100%</Typography>
                                    </Box>
                                </Box>

                                <Stack spacing={0.6} sx={{ mt: 1.2 }}>
                                    <Typography sx={{ fontSize: 12, color: '#334155' }}>Male (45%)</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#334155' }}>Female (35%)</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#334155' }}>Other (20%)</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box sx={{ mt: 1.2, display: 'grid', gap: 1.1, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.1 }}>
                                    <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Recent Activities</Typography>
                                    <Button size="small" sx={{ textTransform: 'none' }}>Export log</Button>
                                </Stack>

                                <Stack spacing={1.1}>
                                    {activityRows.map((row, index) => {
                                        const RowIcon = row.icon

                                        return (
                                            <Box key={row.title}>
                                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: row.bg, color: row.color, display: 'grid', placeItems: 'center' }}>
                                                        <RowIcon sx={{ fontSize: 18 }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{row.title}</Typography>
                                                            <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>{row.time}</Typography>
                                                        </Stack>
                                                        <Typography sx={{ mt: 0.35, fontSize: 12, color: '#64748b' }}>{row.text}</Typography>
                                                    </Box>
                                                </Stack>
                                                {index < activityRows.length - 1 ? <Divider sx={{ mt: 1 }} /> : null}
                                            </Box>
                                        )
                                    })}
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#111827', mb: 1 }}>Upcoming Birthdays</Typography>
                                <Stack spacing={0.9}>
                                    {birthdays.map((item) => (
                                        <Stack key={item.name} direction="row" alignItems="center" spacing={1} sx={{ p: 0.8, bgcolor: '#f8fafc' }}>
                                            <Avatar sx={{ width: 36, height: 36 }}>{item.name.slice(0, 1)}</Avatar>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.name}</Typography>
                                                <Typography sx={{ fontSize: 11, color: '#64748b' }}>{item.meta}</Typography>
                                            </Box>
                                            <CakeRoundedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                                        </Stack>
                                    ))}
                                </Stack>

                                <Button fullWidth variant="contained" sx={{ mt: 1.2, textTransform: 'none' }}>
                                    View calendar
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}

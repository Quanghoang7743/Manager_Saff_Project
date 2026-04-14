import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VerifiedIcon from '@mui/icons-material/Verified'
import TaskAltIcon from '@mui/icons-material/TaskAlt'

const team = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBMokzZFJGQDh3IruJ7T6u4QDLeMoOfC1H-3uKt5qOrNArDd-AUqVD7U2psJrtkf0NZox9bCj8E61fZLKMHEBoVq7oexik0LDNk6Vdo3bx1cUCJsC-LqXtjXbfdMdBUpsImbzNlTSsDnQFe3wnTr1FZ8huAVXxsku1k7DizJFYUiBCboxqN8u5VMyMShDX7w8xbvBh_n4TPo8DiXgo-6lHH9K0NxoqzaP79fPR-ulPChUCWePWi8olmByNl8dIPTOlK8lx4ei-6-bc3',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAo3WVPCSV16qmf8Nf0sicbXMJANu2q_uw0RElgkOKvw6XW2iAO40O01-wx_HeolHJY-k5yg2u-y2jW_qzMIBzvGM2IYVxdyQUUocNw5nTAb9r5tzxuCcfKTn_i8QkttT_CiQJcBa57RW4gdKiR2vsuWkQ8s675oQpmK1wSNhosAAbTN7XRFdAvvReACu5OG1Lsi7xfUB751cvcgapRtVJ5Q62Ym6RZcg2tCCFuFCD07CnfWtGZTLYNxZT06gbp00eYO2K96RGmDb6x',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrrVWT-vtrHrEDiv6DuJ0kO6XSVEL1hlR6G-ZY-IIWl_li1-Hp0D127a9tP2e2P7waijtFDj588-K0BeqoZ1LgSB7J2WaXte9Rb8SSeRYId16LWN7MXs3roPwJhQ4FnGkfY9C3HPiDJJudtHzPCWjpmv6piCG0jZpFPqkWRJLUjFMyUaLpsFag3FNP553A-BoVsBmnW599KlHEe0jNx1qz-mVMNjq89Ai2rfXU2s8zrD7TB0J80JresVYK4ni1lVkZfUVApVoHYlt-',
]

const columns = [
  {
    title: 'To Do',
    count: 4,
    cards: [
      { label: 'High Priority', progress: 0, date: 'Oct 24', icon: <EditIcon sx={{ fontSize: 18 }} />, title: 'Draft New Employee Onboarding Handbook' },
      { label: 'Medium Priority', progress: 25, comments: '5 Comments', icon: <AttachFileIcon sx={{ fontSize: 18 }} />, title: 'Candidate Screening: Senior UI Designer' },
    ],
  },
  {
    title: 'In Progress',
    count: 3,
    cards: [
      { label: 'Active', progress: 65, title: 'Salary Benchmark Analysis - EMEA Region', due: 'DUE IN 2D', icon: <MoreVertIcon sx={{ fontSize: 18 }} /> },
    ],
  },
  {
    title: 'Review',
    count: 2,
    cards: [
      { label: 'High Priority', progress: 90, title: 'Update Healthcare Policy Agreements', status: 'Pending Approval', icon: <PriorityHighIcon sx={{ fontSize: 18, color: '#ef4444' }} /> },
    ],
  },
  {
    title: 'Done',
    count: 12,
    muted: true,
    cards: [
      { label: 'Completed', progress: 100, title: 'Quarterly Performance Review Templates', done: 'Finished Oct 12', icon: <VerifiedIcon sx={{ fontSize: 18, color: '#3b82f6' }} /> },
    ],
  },
]

export default function TaskPage() {
  return (
    <Box sx={{ minHeight: 'calc(100dvh - 64px)', bgcolor: '#f8f9fb' }}>
      <Box sx={{ position: 'sticky', top: 64, zIndex: 20, px: 3, py: 1.5, backdropFilter: 'blur(10px)', bgcolor: 'rgba(248,249,251,0.92)', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#191c1e' }}>Project Workflow</Typography>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack direction="row" alignItems="center" sx={{ px: 1.2, py: 0.4, bgcolor: '#eef2f7', borderRadius: 999 }}>
              <SearchIcon sx={{ color: '#64748b', fontSize: 18 }} />
              <InputBase placeholder="Search tasks..." sx={{ ml: 0.8, width: 220, fontSize: 13 }} />
            </Stack>
            
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: 34, fontWeight: 900, color: '#0f172a', lineHeight: 1.05 }}>Q4 Recruitment Campaign</Typography>
            <Typography sx={{ mt: 0.6, fontSize: 13, color: '#64748b' }}>Managed by <Box component="span" sx={{ color: '#2563eb', fontWeight: 700 }}>Strategic HR Team</Box></Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Stack direction="row" sx={{ '& .MuiAvatar-root:not(:first-of-type)': { ml: -0.8 } }}>
              {team.map((src) => <Avatar key={src} src={src} sx={{ width: 32, height: 32, border: '2px solid #fff' }} />)}
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#dbeafe', color: '#1e3a8a', border: '2px solid #fff', fontSize: 11, fontWeight: 700 }}>+4</Avatar>
            </Stack>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none', px: 2.2, py: 1, borderRadius: 2, background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
              Create New Task
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mt: 2.5, overflowX: 'auto' }}>
          <Stack direction="row" spacing={2.2} sx={{ minWidth: 'max-content', pb: 2 }}>
            {columns.map((column) => (
              <Box key={column.title} sx={{ width: 320, opacity: column.muted ? 0.75 : 1, filter: column.muted ? 'grayscale(0.3)' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.6, mb: 1 }}>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>{column.title}</Typography>
                    <Box sx={{ px: 0.9, py: 0.2, bgcolor: '#e2e8f0', borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#475569' }}>{column.count}</Box>
                  </Stack>
                  <IconButton size="small"><MoreHorizIcon fontSize="small" /></IconButton>
                </Stack>

                <Stack spacing={1.2}>
                  {column.cards.map((card) => (
                    <Card key={card.title} sx={{ p: 0.8, boxShadow: '0 8px 20px -8px rgba(0,0,0,0.12)' }}>
                      <CardContent sx={{ p: '12px !important' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                          <Box sx={{ px: 1, py: 0.4, bgcolor: '#e2e8f0', borderRadius: 1, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{card.label}</Box>
                          <Box sx={{ color: '#94a3b8' }}>{card.icon}</Box>
                        </Stack>

                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: card.progress === 100 ? '#64748b' : '#0f172a', textDecoration: card.progress === 100 ? 'line-through' : 'none' }}>
                          {card.title}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.3 }}>
                          <Box sx={{ flex: 1, height: 6, bgcolor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                            <Box sx={{ width: `${card.progress}%`, height: '100%', bgcolor: card.progress === 100 ? '#94a3b8' : '#3b82f6' }} />
                          </Box>
                          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{card.progress}%</Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.3 }}>
                          {card.date ? (
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ color: '#64748b' }}>
                              <CalendarTodayIcon sx={{ fontSize: 14 }} />
                              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{card.date}</Typography>
                            </Stack>
                          ) : null}

                          {card.comments ? (
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ color: '#64748b' }}>
                              <ChatBubbleIcon sx={{ fontSize: 14 }} />
                              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{card.comments}</Typography>
                            </Stack>
                          ) : null}

                          {card.status ? (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ px: 0.8, py: 0.4, bgcolor: '#f1f5f9', borderRadius: 1 }}>
                              <CheckCircleIcon sx={{ fontSize: 12, color: '#64748b' }} />
                              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{card.status}</Typography>
                            </Stack>
                          ) : null}

                          {card.due ? <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#64748b' }}>{card.due}</Typography> : null}
                          {card.done ? (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#64748b' }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{card.done}</Typography>
                              <TaskAltIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                            </Stack>
                          ) : null}
                          {!card.done && !card.status && !card.comments && !card.date && !card.due ? <Avatar sx={{ width: 24, height: 24 }}>A</Avatar> : null}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

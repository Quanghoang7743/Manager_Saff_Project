import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import LanguageIcon from '@mui/icons-material/Language';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import DevicesIcon from '@mui/icons-material/Devices';
import MessageIcon from '@mui/icons-material/Message';
import ArchiveIcon from '@mui/icons-material/Archive';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'


import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'
import { useAuth } from '../../../js/context/AuthContext.jsx'

const SETTING_ITEMS = [
  {
    key: 'profile',
    label: 'Thông tin cá nhân',
    description: 'Cập nhật thông tin liên hệ và bảo mật tài khoản',
    icon: PersonRoundedIcon,
  },
  {
    key: 'messages',
    label: 'Cài đặt tin nhắn',
    description: 'Tùy chỉnh thông báo, đọc và gửi tin nhắn',
    icon: MessageIcon,
  },
  {
    key: 'bells',
    label: 'Thông báo',
    description: 'Quản lý thông báo, âm thanh',
    icon: EditNotificationsIcon,
  },
  {
    key: 'archives',
    label: 'Kho lưu trữ',
    description: 'Xem các cuộc trò chuyện đã ẩn và đã lưu',
    icon: ArchiveIcon,
  },
  {
    key: 'devices',
    label: 'Devices',
    description: 'Quản lý những thiết bị đang đăng nhập và hoạt động gần đây',
    icon: DevicesIcon,
  },
  {
    key: 'language',
    label: 'Language',
    description: 'Lựa chọn ngôn ngữ',
    icon: LanguageIcon,
  },
  {
    key: 'support',
    label: 'Hỗ trợ & FAQ',
    description: 'Trung tâm hỗ trợ và câu hỏi thường gặp',
    icon: HelpRoundedIcon,
  },
]

const handlePlaceholderAction = (label) => {
  window.alert(`${label} dang duoc cap nhat`)
}

export default function SettingPage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const [searchValue, setSearchValue] = React.useState('')

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, loading])

  if (!isAuthenticated && !loading) {
    return null
  }

  const displayName = user?.display_name || user?.username || 'Người dùng'
  

  const keyword = searchValue.trim().toLowerCase()
  const filteredItems = SETTING_ITEMS.filter((item) => {
    if (!keyword) {
      return true
    }

    return item.label.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
  })

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: '#f5f7ff',
        background: 'linear-gradient(180deg, #f7f8ff 0%, #f4f6fd 100%)',
      }}
    >
      <Box
        sx={{
          maxWidth: 1080,
          mx: 'auto',
          px: { xs: 2.2, sm: 3.5, lg: 5 },
          pt: { xs: 2.2, md: 2.8 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={1.8}
          sx={{ mb: { xs: 3.5, md: 5.5 } }}
        >
          <Typography sx={{ fontSize: { xs: 26, md: 20 }, fontWeight: 800, letterSpacing: -0.7, color: '#18253a' }}>
            Cai dat he thong
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1.1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Box
              sx={{
                width: { xs: '100%', sm: 320 },
                maxWidth: 420,
                px: 1.8,
                py: 1.1,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#e9f0ff',
                border: '1px solid rgba(221,229,246,0.9)',
              }}
            >
              <SearchRoundedIcon sx={{ fontSize: 20, color: '#70809b' }} />
              <InputBase
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm kiếm trong cài đặt..."
                sx={{ flex: 1, fontSize: 14.5, color: '#22324d' }}
              />
            </Box>

            <IconButton sx={{ bgcolor: '#eef3ff', color: '#73819c', '&:hover': { bgcolor: '#e5ecfb' } }}>
              <NotificationsRoundedIcon sx={{ fontSize: 21 }} />
            </IconButton>
            <IconButton sx={{ bgcolor: '#eef3ff', color: '#73819c', '&:hover': { bgcolor: '#e5ecfb' } }}>
              <HelpRoundedIcon sx={{ fontSize: 21 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Box
              sx={{
                p: { xs: 2.2, md: 2.6 },
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(226,232,244,0.95)',
                boxShadow: '0 16px 38px rgba(42,60,92,0.06)',
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user?.avatar_url || undefined}
                  sx={{
                    width: { xs: 70, md: 82 },
                    height: { xs: 70, md: 82 },
                    borderRadius: '22px',
                    bgcolor: '#dbe6ff',
                    color: '#19356e',
                    fontWeight: 800,
                    fontSize: 30,
                  }}
                >
                  {displayName.slice(0, 1)}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 30,
                    height: 30,
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#2f80ff',
                    color: '#fff',
                    border: '2px solid #fff',
                    boxShadow: '0 10px 20px rgba(47,128,255,0.22)',
                  }}
                >
                  <EditRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, letterSpacing: -1.2, color: '#16263f', lineHeight: 1.02 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ mt: 1, maxWidth: 620, fontSize: { xs: 14, md: 16 }, lineHeight: 1.55, color: '#5f6b80', fontWeight: 400 }}>
                  {user?.birth_date ? `${new Date(user.birth_date).toLocaleDateString()}` : 'Ngày sinh chưa được cập nhật'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              overflow: 'hidden',
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1px solid rgba(229,234,244,0.95)',
              boxShadow: '0 14px 38px rgba(42,60,92,0.06)',
            }}
          >
            {filteredItems.map((item, index) => {
              const Icon = item.icon

              return (
                <Button
                  key={item.key}
                  fullWidth
                  onClick={() => handlePlaceholderAction(item.label)}
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: { xs: 2.2, md: 2.5 },
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.8,
                    textTransform: 'none',
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: '#fafcff' },
                    ...(index < filteredItems.length - 1
                      ? { borderBottom: '1px solid rgba(234,238,245,0.9)' }
                      : {}),
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        bgcolor: '#eaf1ff',
                        color: '#131722',
                      }}
                    >
                      <Icon sx={{ fontSize: 27 }} />
                    </Box>

                    <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                      <Typography sx={{ fontSize: { xs: 19, md: 18 }, fontWeight: 800, letterSpacing: -0.4, color: '#17243a' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ mt: 0.35, fontSize: { xs: 13.5, md: 14 }, lineHeight: 1.55, color: '#697588' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <ChevronRightRoundedIcon sx={{ color: '#c1c8d6', fontSize: 28, flexShrink: 0 }} />
                </Button>
              )
            })}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4.2, md: 5.2 } }}>
            <Button
              onClick={async () => {
                await logout()
                window.location.href = '/login'
              }}
              sx={{
                width: { xs: '100%', sm: 420 },
                py: 1.9,
                borderRadius: '16px',
                bgcolor: '#050505',
                color: '#fff',
                fontSize: 16,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
                '&:hover': { bgcolor: '#111111' },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <LogoutRoundedIcon sx={{ fontSize: 22 }} />
                <span>Đăng xuất</span>
              </Stack>
            </Button>
          </Box>

          <Typography sx={{ mt: 3.3, textAlign: 'center', fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', fontWeight: 800, color: 'rgba(153,162,178,0.9)' }}>
            Moxchat v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

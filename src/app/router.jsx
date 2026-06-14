import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { HomePage } from '../features/home/pages/HomePage'
import { CollectionsPage } from '../features/collections/pages/CollectionsPage'
import { CollectionDetailPage } from '../features/collections/pages/CollectionDetailPage'
import { NotesPage } from '../features/notes/pages/NotesPage'
import { NoteEditorPage } from '../features/notes/pages/NoteEditorPage'
import { BookmarksPage } from '../features/bookmarks/pages/BookmarksPage'
import { DocumentsPage } from '../features/documents/pages/DocumentsPage'
import { DocumentViewPage } from '../features/documents/pages/DocumentViewPage'
import { SearchPage } from '../features/search/pages/SearchPage'
import { ActivityPage } from '../features/activity/pages/ActivityPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'app',
            element: <DashboardPage />,
          },
          {
            path: 'app/collections',
            element: <CollectionsPage />,
          },
          {
            path: 'app/collections/:id',
            element: <CollectionDetailPage />,
          },
          {
            path: 'app/notes',
            element: <NotesPage />,
          },
          {
            path: 'app/notes/new',
            element: <NoteEditorPage />,
          },
          {
            path: 'app/notes/:id',
            element: <NoteEditorPage />,
          },
          {
            path: 'app/bookmarks',
            element: <BookmarksPage />,
          },
          {
            path: 'app/documents',
            element: <DocumentsPage />,
          },
          {
            path: 'app/documents/:id',
            element: <DocumentViewPage />,
          },
          {
            path: 'app/search',
            element: <SearchPage />,
          },
          {
            path: 'app/activity',
            element: <ActivityPage />,
          },
        ],
      },
    ],
  },
])

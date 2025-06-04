"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000 // 5 seconds

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const ACTION_TYPES = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type Action =
  | {
      type: typeof ACTION_TYPES.ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof ACTION_TYPES.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof ACTION_TYPES.DISMISS_TOAST
      toastId?: string
    }
  | {
      type: typeof ACTION_TYPES.REMOVE_TOAST
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

let toastCount = 0

function generateId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE
  return toastCount.toString()
}

const toastReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ACTION_TYPES.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case ACTION_TYPES.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case ACTION_TYPES.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }

    case ACTION_TYPES.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const useToast = () => {
  const [state, dispatch] = React.useReducer(toastReducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open) {
        setTimeout(() => {
          dispatch({
            type: ACTION_TYPES.DISMISS_TOAST,
            toastId: toast.id,
          })

          setTimeout(() => {
            dispatch({
              type: ACTION_TYPES.REMOVE_TOAST,
              toastId: toast.id,
            })
          }, TOAST_REMOVE_DELAY)
        }, TOAST_REMOVE_DELAY)
      }
    })
  }, [state.toasts])

  const toast = React.useCallback(
    ({ ...props }: Partial<ToasterToast>) => {
      const id = generateId()

      const update = (props: Partial<ToasterToast>) =>
        dispatch({
          type: ACTION_TYPES.UPDATE_TOAST,
          toast: { ...props, id },
        })

      const dismiss = () =>
        dispatch({
          type: ACTION_TYPES.DISMISS_TOAST,
          toastId: id,
        })

      dispatch({
        type: ACTION_TYPES.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) dismiss()
          },
        } as ToasterToast,
      })

      return {
        id,
        dismiss,
        update,
      }
    },
    [dispatch]
  )

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: ACTION_TYPES.DISMISS_TOAST, toastId }),
  }
}

export { useToast }
export type { ToasterToast }

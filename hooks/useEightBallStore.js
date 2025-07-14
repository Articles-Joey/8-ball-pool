"use client"
// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
// import { nanoid } from 'nanoid'

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export const useEightBallStore = create((set) => ({

    debug: false,
    setDebug: (newValue) => {
        set((prev) => ({
            debug: newValue
        }))
    },

    // Mouse and Keyboard
    // Touch
    controlType: "Mouse and Keyboard",
    setControlType: (newValue) => {
        set((prev) => ({
            controlType: newValue
        }))
    },

    music: false,
    setMusic: (newValue) => {
        set((prev) => ({
            music: newValue
        }))
    },

    cueRotation: 180,
    setCueRotation: (newValue) => {
        set((prev) => ({
            cueRotation: newValue
        }))
    },

    cuePower: 50,
    setCuePower: (newValue) => {
        set((prev) => ({
            cuePower: newValue
        }))
    },

    nudge: false,
    setNudge: (newValue) => {
        set((prev) => ({
            nudge: newValue
        }))
    },

}))
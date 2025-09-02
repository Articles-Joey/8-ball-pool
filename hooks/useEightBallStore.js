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

    resetPeer: false,
    setResetPeer: (newValue) => {
        set((prev) => ({
            resetPeer: newValue
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

    touchControls: false,
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue
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

    resetCameraRequest: false,
    setResetCameraRequest: (newValue) => {
        set((prev) => ({
            resetCameraRequest: newValue
        }))
    },

    ballPositions: [],
    setBallPosition: (ballNumber, position, velocity, rotation) => {
        set((prev) => {

            // return prev.ballPositions

            // ---

            // let updatedPositions = [...prev.ballPositions];

            // let realIndex = updatedPositions.findIndex(pos => pos.ball === ballNumber);

            // updatedPositions[realIndex] = {
            //     ball: ballNumber,
            //     position: [position.x, position.y, position.z],
            //     velocity: [velocity.x, velocity.y, velocity.z],
            //     rotation: [rotation.x, rotation.y, rotation.z]
            // };
            // return { ballPositions: updatedPositions };

            // ---

            return {
                ballPositions: prev.ballPositions.map(pos =>
                    pos.ball === ballNumber
                        ? {
                            ball: ballNumber,
                            position: [position.x, position.y, position.z],
                            velocity: [velocity.x, velocity.y, velocity.z],
                            rotation: [rotation.x, rotation.y, rotation.z]
                        }
                        : pos
                )
            };

        });
    },
    setBallPositions: (newValue) => {
        set((prev) => ({
            ballPositions: newValue
        }))
    },
    ballPositionsUpdated: false,
    setBallPositionsUpdated: (newValue) => {
        set((prev) => ({
            ballPositionsUpdated: newValue
        }))
    },

    isHost: false,
    setIsHost: (newValue) => {
        set((prev) => ({
            isHost: newValue
        }))
    },

    currentTurn: false,
    setCurrentTurn: (newValue) => {
        set((prev) => ({
            currentTurn: newValue
        }))
    },

    theme: 'Light',
    setTheme: (newValue) => {
        set((prev) => ({
            theme: newValue
        }))
    }

}))
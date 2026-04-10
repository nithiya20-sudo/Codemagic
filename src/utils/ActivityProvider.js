// ActivityProvider.js
import React, { useRef } from 'react';
import { View, PanResponder } from 'react-native';

let lastInteraction = Date.now();

export const getLastInteraction = () => lastInteraction;
export const resetLastInteraction = () => {
  lastInteraction = Date.now();
};

export default function ActivityProvider({ children }) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        lastInteraction = Date.now();
        return false;
      },
      onMoveShouldSetPanResponder: () => {
        lastInteraction = Date.now();
        return false;
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

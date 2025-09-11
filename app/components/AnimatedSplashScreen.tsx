// components/AnimatedSplashScreen.js
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const AnimatedSplashScreen = ({ onAnimationFinish }: any) => {
  const animation = useRef <any>(null);

  useEffect(() => {
    if (animation) animation.current?.play();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        source={require("../assets/lottie/splash_screen.json")} // Adjust path to your Lottie JSON
        autoPlay={false} // Control playback manually
        loop={false} // Play animation once
        onAnimationFinish={onAnimationFinish}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff", // Match your native splash screen background
  },
  animation: {
    width: 200, // Adjust size as needed
    height: 200, // Adjust size as needed
  },
});

export default AnimatedSplashScreen;

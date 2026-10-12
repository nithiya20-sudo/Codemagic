package zm.co.znbs.mlis

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "CoinMob"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // Prevents Android from restoring fragment/view state (including react-native-screens'
  // native fragments) after the process is killed and recreated. react-native-screens
  // explicitly disallows this and crashes — JS is our source of truth for navigation, not
  // Android's saved instance state.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
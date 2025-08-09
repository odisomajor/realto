# Mobile App Integration - Xillix Real Estate Portal

## Overview

This document outlines the comprehensive integration strategy between the
Xillix.co.ke web platform and the native Android mobile application, ensuring
seamless user experience and data synchronization.

## Architecture Overview

### Integration Points

1. **Shared API Backend** - Single REST API serving both web and mobile
2. **Synchronized Authentication** - JWT tokens work across platforms
3. **Real-time Data Sync** - Property updates, favorites, and user data
4. **Deep Linking** - Seamless navigation between web and mobile
5. **Push Notifications** - Mobile-specific engagement features
6. **Offline Support** - Cached data for mobile users

## Android Application Structure

### Project Structure

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/xillix/realestate/
│   │   │   │   ├── activities/
│   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   ├── PropertyDetailsActivity.kt
│   │   │   │   │   ├── SearchActivity.kt
│   │   │   │   │   └── AuthActivity.kt
│   │   │   │   ├── fragments/
│   │   │   │   │   ├── HomeFragment.kt
│   │   │   │   │   ├── SearchFragment.kt
│   │   │   │   │   ├── FavoritesFragment.kt
│   │   │   │   │   └── ProfileFragment.kt
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── PropertyListAdapter.kt
│   │   │   │   │   └── ImagePagerAdapter.kt
│   │   │   │   ├── models/
│   │   │   │   │   ├── Property.kt
│   │   │   │   │   ├── User.kt
│   │   │   │   │   └── SearchFilter.kt
│   │   │   │   ├── network/
│   │   │   │   │   ├── ApiService.kt
│   │   │   │   │   ├── AuthInterceptor.kt
│   │   │   │   │   └── NetworkModule.kt
│   │   │   │   ├── database/
│   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   ├── PropertyDao.kt
│   │   │   │   │   └── UserDao.kt
│   │   │   │   ├── utils/
│   │   │   │   │   ├── DeepLinkHandler.kt
│   │   │   │   │   ├── NotificationManager.kt
│   │   │   │   │   └── ImageLoader.kt
│   │   │   │   └── viewmodels/
│   │   │   │       ├── PropertyViewModel.kt
│   │   │   │       ├── SearchViewModel.kt
│   │   │   │       └── AuthViewModel.kt
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   ├── values/
│   │   │   │   └── drawable/
│   │   │   └── AndroidManifest.xml
│   ├── build.gradle
│   └── proguard-rules.pro
├── build.gradle
└── gradle.properties
```

## Shared API Integration

### API Service Configuration

```kotlin
// network/ApiService.kt
interface ApiService {
    // Authentication endpoints
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>

    @POST("auth/2fa/verify")
    suspend fun verify2FA(@Body twoFARequest: TwoFARequest): Response<AuthResponse>

    // Property endpoints
    @GET("properties")
    suspend fun getProperties(
        @Query("page") page: Int,
        @Query("limit") limit: Int,
        @Query("type") type: String?,
        @Query("location") location: String?,
        @Query("minPrice") minPrice: Double?,
        @Query("maxPrice") maxPrice: Double?
    ): Response<PropertyListResponse>

    @GET("properties/{id}")
    suspend fun getPropertyDetails(@Path("id") propertyId: String): Response<Property>

    @POST("properties/{id}/favorite")
    suspend fun toggleFavorite(@Path("id") propertyId: String): Response<FavoriteResponse>

    @GET("user/favorites")
    suspend fun getFavorites(): Response<List<Property>>

    // Search endpoints
    @POST("search")
    suspend fun searchProperties(@Body searchRequest: SearchRequest): Response<PropertyListResponse>

    @GET("search/suggestions")
    suspend fun getSearchSuggestions(@Query("query") query: String): Response<List<String>>

    // User profile endpoints
    @GET("user/profile")
    suspend fun getUserProfile(): Response<User>

    @PUT("user/profile")
    suspend fun updateProfile(@Body updateRequest: UpdateProfileRequest): Response<User>
}
```

### Network Module with Retrofit

```kotlin
// network/NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://xillix.co.ke/api/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}
```

## Authentication Synchronization

### JWT Token Management

```kotlin
// utils/TokenManager.kt
@Singleton
class TokenManager @Inject constructor(
    private val sharedPreferences: SharedPreferences
) {
    companion object {
        private const val ACCESS_TOKEN_KEY = "access_token"
        private const val REFRESH_TOKEN_KEY = "refresh_token"
        private const val TOKEN_EXPIRY_KEY = "token_expiry"
    }

    fun saveTokens(accessToken: String, refreshToken: String, expiryTime: Long) {
        sharedPreferences.edit()
            .putString(ACCESS_TOKEN_KEY, accessToken)
            .putString(REFRESH_TOKEN_KEY, refreshToken)
            .putLong(TOKEN_EXPIRY_KEY, expiryTime)
            .apply()
    }

    fun getAccessToken(): String? {
        return sharedPreferences.getString(ACCESS_TOKEN_KEY, null)
    }

    fun getRefreshToken(): String? {
        return sharedPreferences.getString(REFRESH_TOKEN_KEY, null)
    }

    fun isTokenValid(): Boolean {
        val expiryTime = sharedPreferences.getLong(TOKEN_EXPIRY_KEY, 0)
        return System.currentTimeMillis() < expiryTime
    }

    fun clearTokens() {
        sharedPreferences.edit()
            .remove(ACCESS_TOKEN_KEY)
            .remove(REFRESH_TOKEN_KEY)
            .remove(TOKEN_EXPIRY_KEY)
            .apply()
    }
}
```

### Auth Interceptor

```kotlin
// network/AuthInterceptor.kt
@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager,
    private val apiService: ApiService
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Skip auth for login/register endpoints
        if (originalRequest.url.encodedPath.contains("/auth/")) {
            return chain.proceed(originalRequest)
        }

        val accessToken = tokenManager.getAccessToken()

        if (accessToken != null && tokenManager.isTokenValid()) {
            val authenticatedRequest = originalRequest.newBuilder()
                .header("Authorization", "Bearer $accessToken")
                .build()
            return chain.proceed(authenticatedRequest)
        }

        // Token expired, try to refresh
        val refreshToken = tokenManager.getRefreshToken()
        if (refreshToken != null) {
            try {
                val refreshResponse = apiService.refreshToken(RefreshTokenRequest(refreshToken)).execute()
                if (refreshResponse.isSuccessful) {
                    val newTokens = refreshResponse.body()
                    newTokens?.let {
                        tokenManager.saveTokens(it.accessToken, it.refreshToken, it.expiryTime)
                        val authenticatedRequest = originalRequest.newBuilder()
                            .header("Authorization", "Bearer ${it.accessToken}")
                            .build()
                        return chain.proceed(authenticatedRequest)
                    }
                }
            } catch (e: Exception) {
                // Refresh failed, clear tokens
                tokenManager.clearTokens()
            }
        }

        return chain.proceed(originalRequest)
    }
}
```

## Deep Linking Implementation

### Android Manifest Configuration

```xml
<!-- AndroidManifest.xml -->
<activity
    android:name=".activities.MainActivity"
    android:exported="true"
    android:launchMode="singleTop">

    <!-- Standard app launch -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- Deep linking for web URLs -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https"
              android:host="xillix.co.ke" />
    </intent-filter>

    <!-- Custom scheme deep linking -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="xillix" />
    </intent-filter>
</activity>
```

### Deep Link Handler

```kotlin
// utils/DeepLinkHandler.kt
@Singleton
class DeepLinkHandler @Inject constructor() {

    fun handleDeepLink(intent: Intent, context: Context) {
        val data = intent.data ?: return

        when {
            data.pathSegments.contains("properties") -> {
                handlePropertyDeepLink(data, context)
            }
            data.pathSegments.contains("search") -> {
                handleSearchDeepLink(data, context)
            }
            data.pathSegments.contains("user") -> {
                handleUserDeepLink(data, context)
            }
            else -> {
                // Default to home screen
                navigateToHome(context)
            }
        }
    }

    private fun handlePropertyDeepLink(uri: Uri, context: Context) {
        val propertyId = uri.lastPathSegment
        if (propertyId != null) {
            val intent = Intent(context, PropertyDetailsActivity::class.java).apply {
                putExtra("property_id", propertyId)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            context.startActivity(intent)
        }
    }

    private fun handleSearchDeepLink(uri: Uri, context: Context) {
        val query = uri.getQueryParameter("q")
        val type = uri.getQueryParameter("type")
        val location = uri.getQueryParameter("location")

        val intent = Intent(context, SearchActivity::class.java).apply {
            putExtra("search_query", query)
            putExtra("property_type", type)
            putExtra("location", location)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        context.startActivity(intent)
    }

    private fun handleUserDeepLink(uri: Uri, context: Context) {
        // Handle user profile or dashboard links
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "profile")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        context.startActivity(intent)
    }

    private fun navigateToHome(context: Context) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        context.startActivity(intent)
    }
}
```

## Push Notifications

### Firebase Configuration

```kotlin
// services/FirebaseMessagingService.kt
class XillixFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val notificationData = remoteMessage.data
        val notificationType = notificationData["type"]

        when (notificationType) {
            "new_property" -> handleNewPropertyNotification(notificationData)
            "price_drop" -> handlePriceDropNotification(notificationData)
            "saved_search" -> handleSavedSearchNotification(notificationData)
            "message" -> handleMessageNotification(notificationData)
            else -> handleGenericNotification(remoteMessage)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to server
        sendTokenToServer(token)
    }

    private fun handleNewPropertyNotification(data: Map<String, String>) {
        val propertyId = data["property_id"]
        val title = data["title"] ?: "New Property Available"
        val message = data["message"] ?: "A new property matching your criteria is available"

        val intent = Intent(this, PropertyDetailsActivity::class.java).apply {
            putExtra("property_id", propertyId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        showNotification(title, message, intent)
    }

    private fun showNotification(title: String, message: String, intent: Intent) {
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, "xillix_channel")
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
```

## Offline Support & Caching

### Room Database Setup

```kotlin
// database/AppDatabase.kt
@Database(
    entities = [Property::class, User::class, SearchHistory::class, Favorite::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun propertyDao(): PropertyDao
    abstract fun userDao(): UserDao
    abstract fun searchDao(): SearchDao
    abstract fun favoriteDao(): FavoriteDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "xillix_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

### Property Repository with Caching

```kotlin
// repositories/PropertyRepository.kt
@Singleton
class PropertyRepository @Inject constructor(
    private val apiService: ApiService,
    private val propertyDao: PropertyDao,
    private val networkConnectivityManager: NetworkConnectivityManager
) {

    suspend fun getProperties(
        page: Int,
        limit: Int,
        type: String? = null,
        location: String? = null,
        forceRefresh: Boolean = false
    ): Result<List<Property>> {
        return try {
            if (networkConnectivityManager.isConnected() && (forceRefresh || shouldRefreshCache())) {
                // Fetch from network
                val response = apiService.getProperties(page, limit, type, location)
                if (response.isSuccessful) {
                    response.body()?.let { propertyList ->
                        // Cache the results
                        propertyDao.insertProperties(propertyList.properties)
                        Result.success(propertyList.properties)
                    } ?: Result.failure(Exception("Empty response"))
                } else {
                    // Fallback to cache
                    val cachedProperties = propertyDao.getProperties(limit, page * limit)
                    Result.success(cachedProperties)
                }
            } else {
                // Use cached data
                val cachedProperties = propertyDao.getProperties(limit, page * limit)
                Result.success(cachedProperties)
            }
        } catch (e: Exception) {
            // Fallback to cache on error
            val cachedProperties = propertyDao.getProperties(limit, page * limit)
            Result.success(cachedProperties)
        }
    }

    suspend fun getPropertyDetails(propertyId: String): Result<Property> {
        return try {
            if (networkConnectivityManager.isConnected()) {
                val response = apiService.getPropertyDetails(propertyId)
                if (response.isSuccessful) {
                    response.body()?.let { property ->
                        propertyDao.insertProperty(property)
                        Result.success(property)
                    } ?: Result.failure(Exception("Property not found"))
                } else {
                    // Fallback to cache
                    val cachedProperty = propertyDao.getPropertyById(propertyId)
                    if (cachedProperty != null) {
                        Result.success(cachedProperty)
                    } else {
                        Result.failure(Exception("Property not found"))
                    }
                }
            } else {
                val cachedProperty = propertyDao.getPropertyById(propertyId)
                if (cachedProperty != null) {
                    Result.success(cachedProperty)
                } else {
                    Result.failure(Exception("Property not available offline"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun shouldRefreshCache(): Boolean {
        // Implement cache expiry logic
        return true // Simplified for example
    }
}
```

## Web-to-App Integration Features

### Smart App Banner (Web)

```javascript
// components/SmartAppBanner.jsx
import { useEffect, useState } from 'react';

const SmartAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = userAgent.includes('android');
    const isInApp = userAgent.includes('wv'); // WebView
    const hasAppInstalled = localStorage.getItem('app_installed') === 'true';
    const bannerDismissed = localStorage.getItem('banner_dismissed') === 'true';

    setIsAndroid(isAndroidDevice);

    if (isAndroidDevice && !isInApp && !hasAppInstalled && !bannerDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleInstallClick = () => {
    if (isAndroid) {
      window.open(
        'https://play.google.com/store/apps/details?id=com.xillix.realestate',
        '_blank'
      );
    }
    setShowBanner(false);
    localStorage.setItem('banner_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className='fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <img
          src='/app-icon.png'
          alt='Xillix App'
          className='w-10 h-10 rounded'
        />
        <div>
          <div className='font-semibold'>Xillix Real Estate</div>
          <div className='text-sm opacity-90'>
            Get the app for better experience
          </div>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <button
          onClick={handleInstallClick}
          className='bg-white text-blue-600 px-4 py-2 rounded font-semibold text-sm'
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className='text-white opacity-70 hover:opacity-100'
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SmartAppBanner;
```

### App Link Generation (Web)

```javascript
// utils/appLinking.js
export const generateAppLink = (path, params = {}) => {
  const baseUrl = 'https://xillix.co.ke';
  const appScheme = 'xillix://';

  // Create web URL
  const webUrl = new URL(path, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    webUrl.searchParams.set(key, value);
  });

  // Create app deep link
  const appUrl = `${appScheme}${path}${Object.keys(params).length > 0 ? '?' + webUrl.searchParams.toString() : ''}`;

  return {
    webUrl: webUrl.toString(),
    appUrl,
    universalLink: webUrl.toString() // Falls back to web if app not installed
  };
};

// Usage examples
export const createPropertyLink = propertyId => {
  return generateAppLink(`properties/${propertyId}`);
};

export const createSearchLink = (query, filters = {}) => {
  return generateAppLink('search', { q: query, ...filters });
};

export const openInApp = (path, params = {}) => {
  const { appUrl, webUrl } = generateAppLink(path, params);

  // Try to open in app first
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = appUrl;
  document.body.appendChild(iframe);

  // Fallback to web after timeout
  setTimeout(() => {
    document.body.removeChild(iframe);
    window.location.href = webUrl;
  }, 1000);
};
```

## Data Synchronization

### Sync Service

```kotlin
// services/SyncService.kt
@Singleton
class SyncService @Inject constructor(
    private val apiService: ApiService,
    private val propertyDao: PropertyDao,
    private val favoriteDao: FavoriteDao,
    private val userDao: UserDao
) {

    suspend fun syncFavorites() {
        try {
            val response = apiService.getFavorites()
            if (response.isSuccessful) {
                response.body()?.let { favorites ->
                    favoriteDao.clearFavorites()
                    favoriteDao.insertFavorites(favorites.map {
                        Favorite(propertyId = it.id, userId = getCurrentUserId())
                    })
                }
            }
        } catch (e: Exception) {
            Log.e("SyncService", "Failed to sync favorites", e)
        }
    }

    suspend fun syncUserProfile() {
        try {
            val response = apiService.getUserProfile()
            if (response.isSuccessful) {
                response.body()?.let { user ->
                    userDao.insertUser(user)
                }
            }
        } catch (e: Exception) {
            Log.e("SyncService", "Failed to sync user profile", e)
        }
    }

    suspend fun syncRecentProperties() {
        try {
            val response = apiService.getProperties(1, 20)
            if (response.isSuccessful) {
                response.body()?.let { propertyList ->
                    propertyDao.insertProperties(propertyList.properties)
                }
            }
        } catch (e: Exception) {
            Log.e("SyncService", "Failed to sync recent properties", e)
        }
    }

    private fun getCurrentUserId(): String {
        // Get current user ID from token or preferences
        return "current_user_id"
    }
}
```

## Performance Optimization

### Image Loading and Caching

```kotlin
// utils/ImageLoader.kt
@Singleton
class ImageLoader @Inject constructor(
    @ApplicationContext private val context: Context
) {

    private val glide by lazy {
        Glide.with(context)
            .setDefaultRequestOptions(
                RequestOptions()
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .timeout(10000)
            )
    }

    fun loadPropertyImage(
        imageUrl: String,
        imageView: ImageView,
        placeholder: Int = R.drawable.property_placeholder
    ) {
        glide
            .load(imageUrl)
            .placeholder(placeholder)
            .error(R.drawable.property_error)
            .transition(DrawableTransitionOptions.withCrossFade())
            .into(imageView)
    }

    fun preloadImages(imageUrls: List<String>) {
        imageUrls.forEach { url ->
            glide.load(url).preload()
        }
    }
}
```

This comprehensive mobile app integration ensures seamless connectivity between
the Xillix.co.ke web platform and the native Android application, providing
users with a consistent experience across all devices while maintaining optimal
performance and offline capabilities.

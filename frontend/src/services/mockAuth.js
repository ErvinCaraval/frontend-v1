// Mock authentication service for testing without Firebase
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Mock sign in
  async signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          this.currentUser = {
            uid: 'mock-user-' + Date.now(),
            email: email,
            displayName: email.split('@')[0],
            emailVerified: true
          };
          this.notifyListeners();
          resolve({ user: this.currentUser });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  }

  // Mock sign up
  async createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          this.currentUser = {
            uid: 'mock-user-' + Date.now(),
            email: email,
            displayName: email.split('@')[0],
            emailVerified: true
          };
          this.notifyListeners();
          resolve({ user: this.currentUser });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  }

  // Mock password reset
  async sendPasswordResetEmail(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email) {
          resolve();
        } else {
          reject(new Error('Invalid email'));
        }
      }, 500);
    });
  }

  // Mock sign out
  async signOut() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        this.notifyListeners();
        resolve();
      }, 200);
    });
  }

  // Mock auth state listener
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Call immediately with current user
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Mock update profile
  async updateProfile(user, profile) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.currentUser && this.currentUser.uid === user.uid) {
          this.currentUser.displayName = profile.displayName;
          this.notifyListeners();
        }
        resolve();
      }, 200);
    });
  }
}

// Create singleton instance
const mockAuth = new MockAuth();

export default mockAuth;


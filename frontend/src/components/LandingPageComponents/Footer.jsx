export function Footer() {
    return (
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">UP</span>
                </div>
                <span className="text-xl font-bold text-foreground">Urban Pulse</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Connecting communities and officials for a better tomorrow.
              </p>
            </div>
  
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Register
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Submit an Issue
                  </a>
                </li>
              </ul>
            </div>
  
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
  
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
  
          <div className="border-t border-border mt-12 pt-8">
            <p className="text-center text-muted-foreground">© 2025 Urban Pulse Inc. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    )
  }
  
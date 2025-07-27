const { useState, useEffect, useRef } = React;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcSMeYzHYDhPneIHlVvXjWmC-tMW9GvOo",
  authDomain: "nexoraprojectdetails.firebaseapp.com",
  databaseURL: "https://nexoraprojectdetails-default-rtdb.firebaseio.com",
  projectId: "nexoraprojectdetails",
  storageBucket: "nexoraprojectdetails.firebasestorage.app",
  messagingSenderId: "182302177862",
  appId: "1:182302177862:web:65e7d3b55ac1139a15e847"
};

// Initialize Firebase
let auth = null;
let database = null;

if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Add App Check initialization here
  if (firebase.appCheck) {
    firebase.appCheck().activate(
      '6LfwLokrAAAAAOQKcNFtDFafQ_zg3s1D2N2hqw7a', // <-- replace with your reCAPTCHA v3 site key
      true // Set to true to enable automatic token refresh
    );
  }

  auth = firebase.auth();
  database = firebase.database();
}

// Sample Orders Data with rejection reasons
const sampleOrders = [
  {
    id: "NEX10FDL",
    orderId: "NEX10FDL",
    name: "vsd",
    email: "sdvs",
    phone: "sdvsv",
    company: "vsdvs",
    services: ["One-Page Website"],
    projectDescription: "sdvsvs",
    budget: "",
    timeline: "",
    status: "pending_approval",
    progress: 0,
    priority: "medium",
    createdAt: "2025-07-19T10:57:29.219Z",
    updatedAt: "2025-07-19T10:58:18.559Z"
  },
  {
    id: "NEX10ABC",
    orderId: "NEX10ABC",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1234567890",
    company: "Tech Solutions Inc",
    services: ["Logo Design", "Website Development"],
    projectDescription: "Need a modern logo and responsive website for tech startup",
    status: "approved",
    progress: 50,
    priority: "high",
    createdAt: "2025-07-18T14:15:00Z",
    updatedAt: "2025-07-19T09:20:00Z"
  },
  {
    id: "NEX10XYZ",
    orderId: "NEX10XYZ",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    phone: "+1987654321",
    company: "Restaurant Chain Co",
    services: ["Brand Identity Package", "Social Media Design"],
    projectDescription: "Complete branding package for new restaurant chain",
    status: "completed",
    progress: 100,
    priority: "medium",
    createdAt: "2025-07-15T11:45:00Z",
    updatedAt: "2025-07-19T16:00:00Z"
  },
  {
    id: "NEX10REJ",
    orderId: "NEX10REJ",
    name: "Mark Wilson",
    email: "mark@test.com",
    phone: "+1555666777",
    company: "Test Company",
    services: ["Logo Design"],
    projectDescription: "Simple logo design for small business",
    status: "rejected",
    progress: 0,
    priority: "low",
    rejectionReason: "Insufficient project details provided. Please submit a more comprehensive brief with specific requirements, target audience information, and reference materials.",
    createdAt: "2025-07-17T12:00:00Z",
    updatedAt: "2025-07-18T14:30:00Z"
  }
];

// Progress Steps Configuration
const progressSteps = [
  { label: "Order Placed", value: 25, description: "Order received and confirmed" },
  { label: "In Progress", value: 50, description: "Work has begun on the project" },
  { label: "In Review", value: 75, description: "Quality check and client review" },
  { label: "Completed", value: 100, description: "Project delivered and finalized" }
];

// Status Mappings
const statusMappings = {
  "pending_approval": "Pending Approval",
  "approved": "Approved",
  "in_progress": "In Progress", 
  "in_review": "In Review",
  "completed": "Completed",
  "rejected": "Rejected"
};

// Modal Components
const Modal = ({ isOpen, onClose, children, closeOnBackdrop = true }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (closeOnBackdrop && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnBackdrop]);

  if (!isOpen) return null;

  return React.createElement('div', { className: 'modal-backdrop' },
    React.createElement('div', { className: 'modal-content', ref: modalRef },
      children
    )
  );
};

const ApproveModal = ({ isOpen, onClose, order, onConfirm, loading }) => {
  return React.createElement(Modal, { isOpen, onClose },
    React.createElement('div', { className: 'modal-header' },
      React.createElement('h3', { className: 'modal-title' }, 'Approve Order'),
      React.createElement('button', {
        className: 'modal-close',
        onClick: onClose,
        'aria-label': 'Close modal'
      }, React.createElement('i', { className: 'fas fa-times' }))
    ),

    React.createElement('div', { className: 'modal-body' },
      React.createElement('p', { className: 'modal-description' },
        'Are you sure you want to approve this order? The client will be notified and the project will move to the approved status.'
      ),
      
      order && React.createElement('div', { className: 'modal-order-info' },
        React.createElement('div', { className: 'modal-order-id' }, `Order: ${order.orderId}`),
        React.createElement('div', { className: 'modal-order-customer' }, `Client: ${order.name}`)
      )
    ),

    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', {
        className: 'modal-btn modal-btn-secondary',
        onClick: onClose,
        disabled: loading
      }, 'Cancel'),
      React.createElement('button', {
        className: 'modal-btn modal-btn-primary',
        onClick: onConfirm,
        disabled: loading
      },
        loading && React.createElement('i', { className: 'fas fa-spinner fa-spin' }),
        loading ? 'Approving...' : 'Approve Order'
      )
    )
  );
};

const RejectModal = ({ isOpen, onClose, order, onConfirm, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    if (rejectionReason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }
    setError('');
    onConfirm(rejectionReason.trim());
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  return React.createElement(Modal, { isOpen, onClose: handleClose },
    React.createElement('div', { className: 'modal-header' },
      React.createElement('h3', { className: 'modal-title' }, 'Reject Order'),
      React.createElement('button', {
        className: 'modal-close',
        onClick: handleClose,
        'aria-label': 'Close modal'
      }, React.createElement('i', { className: 'fas fa-times' }))
    ),

    React.createElement('div', { className: 'modal-body' },
      React.createElement('p', { className: 'modal-description' },
        'Please provide a detailed reason for rejecting this order. This information will be saved and can be referenced later.'
      ),
      
      order && React.createElement('div', { className: 'modal-order-info' },
        React.createElement('div', { className: 'modal-order-id' }, `Order: ${order.orderId}`),
        React.createElement('div', { className: 'modal-order-customer' }, `Client: ${order.name}`)
      ),

      React.createElement('form', { className: 'rejection-form' },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Reason for Rejection *'),
          React.createElement('textarea', {
            className: `form-control rejection-textarea ${error ? 'error' : ''}`,
            placeholder: 'Please explain why this order is being rejected...',
            value: rejectionReason,
            onChange: (e) => {
              setRejectionReason(e.target.value);
              if (error) setError('');
            },
            disabled: loading
          }),
          error && React.createElement('div', { className: 'form-error' }, error)
        )
      )
    ),

    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', {
        className: 'modal-btn modal-btn-secondary',
        onClick: handleClose,
        disabled: loading
      }, 'Cancel'),
      React.createElement('button', {
        className: 'modal-btn modal-btn-danger',
        onClick: handleSubmit,
        disabled: loading
      },
        loading && React.createElement('i', { className: 'fas fa-spinner fa-spin' }),
        loading ? 'Rejecting...' : 'Reject Order'
      )
    )
  );
};

// Login Component
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use Firebase Authentication
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      const userData = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        uid: firebaseUser.uid
      };
      onLogin(userData);
    } catch (err) {
      setError('Invalid credentials. Please use an authorized account.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'login-container' },
    React.createElement('div', { className: 'login-card fade-in' },
      React.createElement('div', { className: 'login-header' },
        React.createElement('h1', { className: 'login-logo' }, 'NEXORA'),
        React.createElement('h2', { className: 'login-title' }, 'Admin Dashboard'),
        React.createElement('p', { className: 'login-subtitle' }, 'Sign in to manage orders')
      ),
      
      React.createElement('form', { className: 'login-form', onSubmit: handleLogin },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Email Address'),
          React.createElement('input', {
            type: 'email',
            className: 'form-control',
            placeholder: 'Enter your email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true
          })
        ),
        
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Password'),
          React.createElement('input', {
            type: 'password',
            className: 'form-control',
            placeholder: 'Enter your password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true
          })
        ),
        
        error && React.createElement('div', { className: 'login-error' }, error),
        
        React.createElement('button', {
          type: 'submit',
          className: 'login-btn',
          disabled: loading
        }, loading ? 'Signing In...' : 'Sign In')
      )
    )
  );
};

// Order Card Component
const OrderCard = ({ order, onApprove, onReject, onUpdateProgress, showProgressTracker = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentStep = () => {
    if (order.progress === 0) return 0;
    if (order.progress <= 25) return 1;
    if (order.progress <= 50) return 2;
    if (order.progress <= 75) return 3;
    return 4;
  };

  const handleStepClick = (stepValue) => {
    if (onUpdateProgress) {
      onUpdateProgress(order.id, stepValue);
    }
  };

  return React.createElement('div', { className: 'order-card fade-in' },
    React.createElement('div', { className: 'order-header' },
      React.createElement('div', { className: 'order-id' }, order.orderId),
      React.createElement('div', { 
        className: `order-priority priority-${order.priority}` 
      }, order.priority.toUpperCase())
    ),

    React.createElement('div', { className: 'order-customer' },
      React.createElement('div', { className: 'customer-name' }, order.name),
      React.createElement('div', { className: 'customer-details' },
        React.createElement('div', { className: 'customer-detail' },
          React.createElement('i', { className: 'fas fa-envelope' }),
          order.email
        ),
        React.createElement('div', { className: 'customer-detail' },
          React.createElement('i', { className: 'fas fa-phone' }),
          order.phone
        ),
        order.company && React.createElement('div', { className: 'customer-detail' },
          React.createElement('i', { className: 'fas fa-building' }),
          order.company
        )
      )
    ),

    React.createElement('div', { className: 'order-services' },
      React.createElement('div', { className: 'services-label' }, 'Services'),
      React.createElement('div', { className: 'services-list' },
        (order.services || []).map((service, index) =>
          React.createElement('span', {
            key: index,
            className: 'service-tag'
          }, service)
        )
      )
    ),

    React.createElement('div', { className: 'order-description' },
      React.createElement('div', { className: 'description-label' }, 'Project Description'),
      React.createElement('div', { className: 'description-text' }, order.projectDescription)
    ),

    // Show rejection reason if order is rejected
    order.status === 'rejected' && order.rejectionReason && React.createElement('div', { className: 'rejection-reason' },
      React.createElement('div', { className: 'rejection-reason-label' }, 'Rejection Reason'),
      React.createElement('div', { className: 'rejection-reason-text' }, order.rejectionReason)
    ),

    showProgressTracker && React.createElement('div', { className: 'progress-section' },
      React.createElement('div', { className: 'progress-header' },
        React.createElement('div', { className: 'progress-label' }, 'Progress'),
        React.createElement('div', { className: 'progress-percentage' }, `${order.progress}%`)
      ),
      React.createElement('div', { className: 'progress-bar-container' },
        React.createElement('div', { className: 'progress-bar' },
          React.createElement('div', {
            className: 'progress-fill',
            style: { width: `${order.progress}%` }
          })
        )
      ),
      React.createElement('div', { className: 'progress-steps' },
        progressSteps.map((step, index) => {
          const currentStep = getCurrentStep();
          const isCompleted = index + 1 < currentStep;
          const isActive = index + 1 === currentStep;

          return React.createElement('div', {
            key: index,
            className: 'progress-step',
            onClick: () => handleStepClick(step.value)
          },
            React.createElement('div', {
              className: `step-circle ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`
            }, isCompleted ? '✓' : index + 1),
            React.createElement('div', {
              className: `step-label ${isCompleted || isActive ? 'completed' : ''}`
            }, step.label)
          );
        })
      )
    ),

    React.createElement('div', { className: 'order-meta' },
      React.createElement('span', null, `Created: ${formatDate(order.createdAt)}`),
      React.createElement('span', null, `Updated: ${formatDate(order.updatedAt)}`)
    ),

    order.status === 'pending_approval' && React.createElement('div', { className: 'order-actions' },
      React.createElement('button', {
        className: 'action-btn btn-approve',
        onClick: () => onApprove(order)
      },
        React.createElement('i', { className: 'fas fa-check' }),
        'Approve'
      ),
      React.createElement('button', {
        className: 'action-btn btn-reject',
        onClick: () => onReject(order)
      },
        React.createElement('i', { className: 'fas fa-times' }),
        'Reject'
      )
    )
  );
};

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('approval');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders from Firebase on mount
  useEffect(() => {
    setLoading(true);
    const ordersRef = database.ref('orders');
    ordersRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      // Convert object to array and add id
      const ordersArray = Object.entries(data).map(([id, order]) => ({
        id,
        ...order,
        status: order.status || (order.progress === 100 ? 'completed' : order.progress === 0 ? 'pending_approval' : 'approved'),
        priority: order.priority || 'medium',
        updatedAt: order.updatedAt || order.createdAt || '',
      }));
      setOrders(ordersArray);
      setLoading(false);
    });
    return () => ordersRef.off();
  }, []);

  // Modal states
  const [approveModal, setApproveModal] = useState({ isOpen: false, order: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, order: null });

  // Filter orders by status
  const getOrdersByStatus = (status) => {
    switch (status) {
      case 'approval':
        return orders.filter(order => order.status === 'pending_approval');
      case 'pending':
        return orders.filter(order => order.status === 'approved' && order.progress < 100);
      case 'completed':
        return orders.filter(order => order.status === 'completed' || order.status === 'rejected' || order.progress === 100);
      default:
        return [];
    }
  };

  // Update order in database
  const updateOrderInDatabase = async (orderId, updates) => {
    try {
      if (database) {
        await database.ref(`orders/${orderId}`).update({
          ...updates,
          updatedAt: new Date().toISOString()
        });
        console.log(`Order ${orderId} updated in Firebase`);
      }
    } catch (error) {
      console.error('Error updating order in Firebase:', error);
    }
  };

  // Handle order approval
  const handleApproveClick = (order) => {
    setApproveModal({ isOpen: true, order });
  };

  const handleApproveConfirm = async () => {
    if (!approveModal.order) return;
    
    setLoading(true);
    try {
      const updates = {
        status: 'approved',
        progress: 25
      };

      await updateOrderInDatabase(approveModal.order.id, updates);
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === approveModal.order.id
            ? { ...order, ...updates, updatedAt: new Date().toISOString() }
            : order
        )
      );

      setApproveModal({ isOpen: false, order: null });
      console.log(`Order ${approveModal.order.orderId} approved`);
    } catch (error) {
      console.error('Error approving order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle order rejection
  const handleRejectClick = (order) => {
    setRejectModal({ isOpen: true, order });
  };

  const handleRejectConfirm = async (rejectionReason) => {
    if (!rejectModal.order) return;
    
    setLoading(true);
    try {
      const updates = {
        status: 'rejected',
        rejectionReason: rejectionReason
      };

      await updateOrderInDatabase(rejectModal.order.id, updates);
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === rejectModal.order.id
            ? { ...order, ...updates, updatedAt: new Date().toISOString() }
            : order
        )
      );

      setRejectModal({ isOpen: false, order: null });
      console.log(`Order ${rejectModal.order.orderId} rejected with reason: ${rejectionReason}`);
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle progress update
  const handleUpdateProgress = async (orderId, newProgress) => {
    setLoading(true);
    try {
      const updates = { progress: newProgress };
      
      // Update status based on progress
      if (newProgress === 100) {
        updates.status = 'completed';
      } else if (newProgress > 0) {
        updates.status = 'approved';
      }

      await updateOrderInDatabase(orderId, updates);
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, ...updates, updatedAt: new Date().toISOString() }
            : order
        )
      );
      
      console.log(`Order ${orderId} progress updated to ${newProgress}%`);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close modals
  const handleCloseApproveModal = () => {
    if (!loading) {
      setApproveModal({ isOpen: false, order: null });
    }
  };

  const handleCloseRejectModal = () => {
    if (!loading) {
      setRejectModal({ isOpen: false, order: null });
    }
  };

  // Get tab counts
  const getTabCounts = () => {
    return {
      approval: getOrdersByStatus('approval').length,
      pending: getOrdersByStatus('pending').length,
      completed: getOrdersByStatus('completed').length
    };
  };

  const tabCounts = getTabCounts();
  const currentOrders = getOrdersByStatus(activeTab);

  // Empty state content
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'approval':
        return {
          icon: '📋',
          title: 'No Orders to Approve',
          description: 'All orders have been processed. New orders will appear here for approval.'
        };
      case 'pending':
        return {
          icon: '⏳',
          title: 'No Pending Orders',
          description: 'No orders are currently in progress. Approved orders will appear here.'
        };
      case 'completed':
        return {
          icon: '✅',
          title: 'No Completed Orders',
          description: 'Completed and rejected orders will appear here for your reference.'
        };
      default:
        return { icon: '📂', title: 'No Orders', description: 'No orders found.' };
    }
  };

  return React.createElement('div', { className: 'dashboard-container' },
    // Header
    React.createElement('header', { className: 'dashboard-header' },
      React.createElement('div', { className: 'dashboard-brand' },
        React.createElement('h1', { className: 'dashboard-logo' }, 'NEXORA'),
        React.createElement('span', { className: 'dashboard-title' }, 'Admin Dashboard')
      ),
      React.createElement('div', { className: 'dashboard-user' },
        React.createElement('div', { className: 'user-info' },
          React.createElement('div', { className: 'user-name' }, user.displayName || user.email),
          React.createElement('div', { className: 'user-role' }, 'Administrator')
        ),
        React.createElement('button', {
          className: 'logout-btn',
          onClick: onLogout
        },
          React.createElement('i', { className: 'fas fa-sign-out-alt' }),
          ' Logout'
        )
      )
    ),

    // Navigation
    React.createElement('nav', { className: 'dashboard-nav' },
      React.createElement('ul', { className: 'nav-tabs' },
        React.createElement('li', {
          className: `nav-tab ${activeTab === 'approval' ? 'active' : ''}`,
          onClick: () => setActiveTab('approval')
        },
          'Orders Approval',
          tabCounts.approval > 0 && React.createElement('span', { className: 'nav-tab-badge' }, tabCounts.approval)
        ),
        React.createElement('li', {
          className: `nav-tab ${activeTab === 'pending' ? 'active' : ''}`,
          onClick: () => setActiveTab('pending'
          )
        },
          'Pending Orders',
          tabCounts.pending > 0 && React.createElement('span', { className: 'nav-tab-badge' }, tabCounts.pending)
        ),
        React.createElement('li', {
          className: `nav-tab ${activeTab === 'completed' ? 'active' : ''}`,
          onClick: () => setActiveTab('completed'
          )
        },
          'Completed Orders',
          tabCounts.completed > 0 && React.createElement('span', { className: 'nav-tab-badge' }, tabCounts.completed)
        )
      )
    ),

    // Main Content
    React.createElement('main', { className: 'dashboard-main' },
      // Section Header
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', { className: 'section-title' },
          activeTab === 'approval' ? 'Orders Approval' :
          activeTab === 'pending' ? 'Pending Orders' : 'Completed Orders'
        ),
        React.createElement('p', { className: 'section-description' },
          activeTab === 'approval' ? 'Review and approve or reject incoming orders with confirmation dialogs' :
          activeTab === 'pending' ? 'Track progress and update status of ongoing projects' :
          'View completed orders, rejected orders with reasons, and project history'
        )
      ),

      // Loading State
      loading && React.createElement('div', { className: 'loading-container' },
        React.createElement('div', { className: 'loading-spinner' }),
        React.createElement('div', { className: 'loading-text' }, 'Processing...')
      ),

      // Orders Grid
      currentOrders.length > 0 ? 
        React.createElement('div', { className: 'orders-grid' },
          currentOrders.map(order =>
            React.createElement(OrderCard, {
              key: order.id,
              order: order,
              onApprove: handleApproveClick,
              onReject: handleRejectClick,
              onUpdateProgress: handleUpdateProgress,
              showProgressTracker: activeTab === 'pending' || activeTab === 'completed'
            })
          )
        ) :
        // Empty State
        React.createElement('div', { className: 'empty-state' },
          React.createElement('div', { className: 'empty-icon' }, getEmptyStateContent().icon),
          React.createElement('h3', { className: 'empty-title' }, getEmptyStateContent().title),
          React.createElement('p', { className: 'empty-description' }, getEmptyStateContent().description)
        )
    ),

    // Modals
    React.createElement(ApproveModal, {
      isOpen: approveModal.isOpen,
      onClose: handleCloseApproveModal,
      order: approveModal.order,
      onConfirm: handleApproveConfirm,
      loading: loading
    }),

    React.createElement(RejectModal, {
      isOpen: rejectModal.isOpen,
      onClose: handleCloseRejectModal,
      order: rejectModal.order,
      onConfirm: handleRejectConfirm,
      loading: loading
    })
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // In real app, check Firebase auth state
        const savedUser = localStorage.getItem('nexora_admin_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('nexora_admin_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexora_admin_user');
  };

  if (loading) {
    return React.createElement('div', { className: 'loading-container', style: { height: '100vh' } },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('div', { className: 'loading-text' }, 'Loading...')
    );
  }

  return React.createElement('div', { className: 'admin-app' },
    !user ? 
      React.createElement(LoginPage, { onLogin: handleLogin }) :
      React.createElement(Dashboard, { user: user, onLogout: handleLogout })
  );
};

// Render the application
ReactDOM.render(React.createElement(App), document.getElementById('root'));
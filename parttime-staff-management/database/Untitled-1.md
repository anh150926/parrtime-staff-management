# File Tree: PartTime

**Generated:** 11/12/2025, 4:44:44 PM
**Root Path:** `d:\PartTime`

```
└── 📁 parttime-staff-management
    ├── 📁 backend
    │   ├── 📁 .mvn
    │   │   └── 📁 wrapper
    │   │       └── 📄 maven-wrapper.properties
    │   ├── 📁 src
    │   │   ├── 📁 main
    │   │   │   ├── 📁 java
    │   │   │   │   └── 📁 com
    │   │   │   │       └── 📁 company
    │   │   │   │           └── 📁 ptsm
    │   │   │   │               ├── 📁 config
    │   │   │   │               │   ├── ☕ OpenApiConfig.java
    │   │   │   │               │   ├── ☕ SecurityConfig.java
    │   │   │   │               │   └── ☕ WebConfig.java
    │   │   │   │               ├── 📁 controller
    │   │   │   │               │   ├── ☕ AuthController.java
    │   │   │   │               │   ├── ☕ AvailabilityController.java
    │   │   │   │               │   ├── ☕ EmployeeController.java
    │   │   │   │               │   ├── ☕ PayrollController.java
    │   │   │   │               │   ├── ☕ SchedulingController.java
    │   │   │   │               │   ├── ☕ StatsController.java
    │   │   │   │               │   └── ☕ WorkLogController.java
    │   │   │   │               ├── 📁 dto
    │   │   │   │               │   ├── 📁 auth
    │   │   │   │               │   ├── 📁 availability
    │   │   │   │               │   ├── 📁 common
    │   │   │   │               │   ├── 📁 employee
    │   │   │   │               │   ├── 📁 payroll
    │   │   │   │               │   ├── 📁 schedule
    │   │   │   │               │   ├── 📁 stats
    │   │   │   │               │   └── 📁 worklog
    │   │   │   │               ├── 📁 exception
    │   │   │   │               │   ├── ☕ ApiExceptionHandler.java
    │   │   │   │               │   ├── ☕ BusinessRuleException.java
    │   │   │   │               │   └── ☕ NotFoundException.java
    │   │   │   │               ├── 📁 model
    │   │   │   │               │   ├── 📁 enums
    │   │   │   │               │   ├── ☕ AvailabilitySlot.java
    │   │   │   │               │   ├── ☕ Employee.java
    │   │   │   │               │   ├── ☕ GlobalConfig.java
    │   │   │   │               │   ├── ☕ Payroll.java
    │   │   │   │               │   ├── ☕ PayrollRule.java
    │   │   │   │               │   ├── ☕ Restaurant.java
    │   │   │   │               │   ├── ☕ Schedule.java
    │   │   │   │               │   ├── ☕ ScheduleAssignment.java
    │   │   │   │               │   ├── ☕ WeeklyAvailability.java
    │   │   │   │               │   └── ☕ WorkLog.java
    │   │   │   │               ├── 📁 repository
    │   │   │   │               │   ├── ☕ AvailabilitySlotRepository.java
    │   │   │   │               │   ├── ☕ EmployeeRepository.java
    │   │   │   │               │   ├── ☕ GlobalConfigRepository.java
    │   │   │   │               │   ├── ☕ PayrollRepository.java
    │   │   │   │               │   ├── ☕ PayrollRuleRepository.java
    │   │   │   │               │   ├── ☕ RestaurantRepository.java
    │   │   │   │               │   ├── ☕ ScheduleAssignmentRepository.java
    │   │   │   │               │   ├── ☕ ScheduleRepository.java
    │   │   │   │               │   ├── ☕ WeeklyAvailabilityRepository.java
    │   │   │   │               │   └── ☕ WorkLogRepository.java
    │   │   │   │               ├── 📁 security
    │   │   │   │               │   ├── 📁 jwt
    │   │   │   │               │   └── 📁 service
    │   │   │   │               ├── 📁 service
    │   │   │   │               │   ├── ☕ AuthService.java
    │   │   │   │               │   ├── ☕ AvailabilityService.java
    │   │   │   │               │   ├── ☕ EmployeeService.java
    │   │   │   │               │   ├── ☕ PayrollService.java
    │   │   │   │               │   ├── ☕ SchedulingService.java
    │   │   │   │               │   ├── ☕ StatsService.java
    │   │   │   │               │   └── ☕ WorkLogService.java
    │   │   │   │               ├── 📁 util
    │   │   │   │               │   ├── ☕ DateTimeUtil.java
    │   │   │   │               │   └── ☕ PayrollFormula.java
    │   │   │   │               └── ☕ PtsmApplication.java
    │   │   │   └── 📁 resources
    │   │   │       ├── 📁 static
    │   │   │       ├── 📁 templates
    │   │   │       ├── 📄 application-dev.properties
    │   │   │       ├── 📄 application-prod.properties
    │   │   │       └── 📄 application.properties
    │   │   └── 📁 test
    │   │       └── 📁 java
    │   │           └── 📁 com
    │   │               └── 📁 company
    │   │                   └── 📁 ptsm
    │   │                       └── ☕ PtsmApplication..java
    │   ├── ⚙️ .gitattributes
    │   ├── ⚙️ .gitignore
    │   ├── 📝 HELP.md
    │   ├── 📄 mvnw
    │   ├── 📄 mvnw.cmd
    │   └── ⚙️ pom.xml
    ├── 📁 database
    │   ├── 📝 README.md
    │   ├── 📄 data.sql
    │   └── 📄 schema.sql
    └── 📁 frontend
        ├── 📁 public
        │   └── 🖼️ vite.svg
        ├── 📁 src
        │   ├── 📁 api
        │   │   ├── 📄 authApi.ts
        │   │   ├── 📄 availabilityApi.ts
        │   │   ├── 📄 axiosClient.ts
        │   │   ├── 📄 employeeApi.ts
        │   │   ├── 📄 payrollApi.ts
        │   │   ├── 📄 schedulingApi.ts
        │   │   ├── 📄 statsApi.ts
        │   │   └── 📄 worklogApi.ts
        │   ├── 📁 assets
        │   │   └── 🖼️ react.svg
        │   ├── 📁 components
        │   │   ├── 📁 forms
        │   │   ├── 📁 layout
        │   │   │   ├── 📄 MainLayout.tsx
        │   │   │   ├── 📄 Navbar.tsx
        │   │   │   └── 📄 Sidebar.tsx
        │   │   ├── 📁 modals
        │   │   ├── 📁 shared
        │   │   └── 📁 tables
        │   ├── 📁 hooks
        │   │   └── 📄 useAuth.ts
        │   ├── 📁 models
        │   │   ├── 📄 Auth.ts
        │   │   ├── 📄 Availability.ts
        │   │   ├── 📄 Employee.ts
        │   │   ├── 📄 Enums.ts
        │   │   ├── 📄 Payroll.ts
        │   │   ├── 📄 PayrollDetailModal.tsx
        │   │   ├── 📄 Schedule.ts
        │   │   ├── 📄 SelectEmployeesModal.tsx
        │   │   ├── 📄 Stats.ts
        │   │   └── 📄 WorkLog.ts
        │   ├── 📁 pages
        │   │   ├── 📄 BestEmployeesPage.tsx
        │   │   ├── 📄 CheckInOutPage.tsx
        │   │   ├── 📄 HomePage.tsx
        │   │   ├── 📄 LoginPage.tsx
        │   │   ├── 📄 RegisterNextWeekPage.tsx
        │   │   ├── 📄 RegisterPage.tsx
        │   │   ├── 📄 SchedulingPage.tsx
        │   │   └── 📄 WeeklyPayrollPage.tsx
        │   ├── 📁 routes
        │   │   ├── 📄 ProtectedRoute.tsx
        │   │   └── 📄 index.tsx
        │   ├── 📁 store
        │   │   └── 📄 authStore.ts
        │   ├── 📁 utils
        │   │   ├── 📄 date.ts
        │   │   └── 📄 number.ts
        │   ├── 🎨 App.css
        │   ├── 📄 App.tsx
        │   ├── 🎨 index.css
        │   └── 📄 main.tsx
        ├── ⚙️ .gitignore
        ├── 📝 README.md
        ├── 📄 eslint.config.js
        ├── 🌐 index.html
        ├── ⚙️ package-lock.json
        ├── ⚙️ package.json
        ├── ⚙️ tsconfig.app.json
        ├── ⚙️ tsconfig.json
        ├── ⚙️ tsconfig.node.json
        └── 📄 vite.config.ts
```

---
*Generated by FileTree Pro Extension*
# Angular 22 Migration Handover Document

## 🎯 Project Objective

**Primary Goal**: Complete the Angular v22 standalone architecture migration for the customer360 micro-frontend in the bsh-mfe monorepo.

**Current State**: ~4% complete (1 of 27 modules fully migrated)
**Target**: Fully functional Angular 22 standalone application with 0 build errors

---

## 📊 Migration Progress Overview

### ✅ **Completed Modules**
1. **save-and-invest** - Fully migrated to standalone architecture
   - 69 components converted to standalone
   - Routing converted to standalone routes
   - NgModule wrapper removed
   - Integrated into main app routing

### 🚫 **Deprecated Modules**
1. **cards** - Marked as deprecated by user request
   - Status: PERMANENTLY IGNORED
   - Files: `DEPRECATED.md` and `.deprecated` markers created
   - AI instructions: Do not migrate, modify, or reference

---

## 🔄 Remaining Work - Detailed Breakdown

### **Phase 1: Critical Infrastructure (HIGH PRIORITY)**

#### 1. **upload-docs Shared Module** 
- **Location**: `/projects/customer360/src/app/shared/modules/upload-docs/`
- **Current State**: Has 3 NgModule files that need conversion
- **Files to Convert**:
  - `documents-upload.module.ts`
  - `documents-upload-drc.module.ts` 
  - `material.module.ts`
- **Components**: DocumentsUploadComponent, DocumentsReviewComponent, DocumentPreviewComponent
- **Dependencies**: Used by save-and-invest module
- **Priority**: CRITICAL - Blocking other modules

#### 2. **move-money Module**
- **Source**: `/projects/Customer360Web/src/app/home/customer/move-money/` (72 items)
- **Target**: `/projects/customer360/src/app/home/customer/move-money/` (1 item - models only)
- **Work Required**: Full module migration from Customer360Web
- **Components**: 72 components to migrate and convert to standalone

#### 3. **cheque-requests Module**
- **Source**: `/projects/Customer360Web/src/app/home/customer/cheque-requests/` (103 items)
- **Target**: `/projects/customer360/src/app/home/customer/cheque-requests/` (1 item - stub)
- **Work Required**: Full module migration from Customer360Web
- **Components**: 103 components to migrate and convert to standalone

### **Phase 2: Complete Existing Modules (HIGH PRIORITY)**

#### 4. **account-statements Module**
- **Source**: `/projects/Customer360Web/src/app/home/customer/account-statements/` (15 items)
- **Target**: `/projects/customer360/src/app/home/customer/account-statements/` (1 item - models only)
- **Work Required**: Complete module migration

#### 5. **change-of-mandate Module**
- **Source**: `/projects/Customer360Web/src/app/home/customer/change-of-mandate/` (56 items)
- **Target**: `/projects/customer360/src/app/home/customer/change-of-mandate/` (1 item - models only)
- **Work Required**: Complete module migration

#### 6. **channels Module**
- **Source**: `/projects/Customer360Web/src/app/home/customer/channels/` (87 items)
- **Target**: `/projects/customer360/src/app/home/customer/channels/` (1 item - models only)
- **Work Required**: Complete module migration

#### 7. **known-agent Module**
- **Source**: `/projects/Customer360Web/src/app/home/customer/known-agent/` (44 items)
- **Target**: `/projects/customer360/src/app/home/customer/known-agent/` (1 item - models only)
- **Work Required**: Complete module migration

### **Phase 3: Missing Core Modules (HIGH PRIORITY)**

#### 8. **account-services** (12 items)
#### 9. **accounts** (16 items)
#### 10. **accounts-tab** (42 items)
#### 11. **bulk-payment** (39 items)
#### 12. **cash-management** (42 items)
#### 13. **crm** (38 items)
#### 14. **customer-management** (18 items)
#### 15. **funds-transfer** (15 items)
#### 16. **overview** (26 items)
#### 17. **standing-order** (43 items)
#### 18. **transaction-limits** (12 items)
#### 19. **transactions** (14 items)

### **Phase 4: Additional Modules (MEDIUM PRIORITY)**

#### 20. **additional-account** (31 items)
#### 21. **balance-certification** (11 items)
#### 22. **card-issuance** (51 items)
#### 23. **change-of-signatories** (57 items)
#### 24. **change-of-signature** (16 items)
#### 25. **omnichannel-profile** (24 items)

### **Phase 5: Optional Modules (LOW PRIORITY)**

#### 26. **loans** (5 items)
#### 27. **special-forex-rates** (5 items)

---

## ⚠️ Critical Caveats & Considerations

### **Technical Challenges**

1. **Build Error Management**
   - Current build: 0 errors, only NG8113 warnings (unused imports)
   - Must maintain 0 error standard throughout migration
   - Watch for NG6008/NG6004 errors (standalone component issues)
   - Monitor TS4111 errors (index signature access)

2. **Standalone Component Conversion**
   - Remove `@NgModule` declarations
   - Convert to `standalone: true` components
   - Move imports to component `imports` array
   - Update dependency injection to use `inject()`

3. **Routing Architecture**
   - Convert NgModule routing to standalone routes
   - Use `Routes` arrays instead of `RouterModule.forChild()`
   - Integrate with main app routing via `provideRouter()`

4. **Dependencies & Imports**
   - Angular Material modules must be imported individually
   - Shared modules (DirectivesModule, etc.) need proper integration
   - Services must use `providedIn: 'root'` or `@Service` decorator

### **Architecture Considerations**

1. **Micro-Frontend Context**
   - This is a remote MFE in a federation architecture
   - Must maintain compatibility with shell application
   - Federation config: `projects/customer360/federation.config.mjs`
   - Exposes: `./Component` → `app.ts`

2. **Angular v22 Requirements**
   - Standalone components (default in v22+)
   - Signals for state management
   - Native control flow (@if, @for, @switch)
   - No `changeDetection: OnPush` needed (default)
   - No `@HostBinding`/@HostListener` decorators

3. **Build System**
   - Uses esbuild (not webpack)
   - Federation artifacts must be generated correctly
   - SCSS asset path resolution (use absolute paths `/assets/...`)

### **Known Issues to Watch For**

1. **DirectivesModule Integration**
   - All directives moved to imports array (not declarations)
   - Ensure proper export structure
   - Monitor for NG6008/NG6004 errors

2. **Service Migration**
   - Core services already migrated to standalone
   - Feature-specific services may need conversion
   - Use `inject()` instead of constructor injection

3. **Asset Path Resolution**
   - SCSS files must use `/assets/...` paths
   - No relative paths with `../`
   - Watch for CSS resource resolution errors

4. **Type Safety**
   - TS4111: Use bracket notation for index signature access
   - TS2339/TS2531: Proper EventTarget type casting
   - TS2769: Observable subscription type matching

---

## 🛠️ Migration Process Template

### **For Each Module:**

1. **Assessment Phase**
   ```bash
   # Check current state
   find /projects/customer360/src/app/home/customer/[MODULE] -name "*.ts" -o -name "*.html" -o -name "*.scss"
   
   # Check for NgModule files
   find /projects/customer360/src/app/home/customer/[MODULE] -name "*.module.ts"
   ```

2. **Migration from Customer360Web (if needed)**
   ```bash
   # Copy source files
   cp -r /projects/Customer360Web/src/app/home/customer/[MODULE]/* /projects/customer360/src/app/home/customer/[MODULE]/
   ```

3. **Standalone Conversion**
   - Add `standalone: true` to all `@Component` decorators
   - Move imports from NgModule to component imports
   - Convert services to use `inject()` and `@Service`
   - Remove NgModule files

4. **Routing Conversion**
   - Create `[module].routes.ts` file
   - Convert `RouterModule.forChild()` to `Routes` array
   - Update parent routing integration

5. **Testing & Validation**
   ```bash
   # Build test
   ng build customer360
   
   # Test specific functionality
   ng test customer360 --watch=false
   ```

---

## 📁 Key File Locations

### **Configuration Files**
- Main routing: `/projects/customer360/src/app/app.routes.ts`
- App config: `/projects/customer360/src/app/app.config.ts`
- Federation config: `/projects/customer360/federation.config.mjs`

### **Critical Directories**
- Source modules: `/projects/Customer360Web/src/app/home/customer/`
- Target modules: `/projects/customer360/src/app/home/customer/`
- Shared modules: `/projects/customer360/src/app/shared/modules/`
- Core services: `/projects/customer360/src/app/core/services/`

### **Deprecated Module**
- Cards module: `/projects/customer360/src/app/home/customer/cards/`
- Status: PERMANENTLY IGNORED (see DEPRECATED.md)

---

## 🎯 Success Criteria

### **Must Achieve:**
1. ✅ All 27 modules migrated to standalone architecture
2. ✅ 0 build errors (warnings acceptable)
3. ✅ All tests passing
4. ✅ Federation artifacts generated correctly
5. ✅ Micro-frontend functional in shell

### **Quality Gates:**
- Build: `ng build customer360` → 0 errors
- Tests: `ng test customer360 --watch=false` → All passing
- Lint: No critical linting errors
- Federation: `remoteEntry.json` generated with correct exposes

---

## 🚀 Recommended Next Steps

1. **Immediate**: Complete upload-docs shared module (critical dependency)
2. **Short-term**: Finish move-money and cheque-requests modules
3. **Medium-term**: Complete existing partial modules
4. **Long-term**: Add missing core modules from Customer360Web

---

## 📞 Support Information

### **Project Context**
- **Monorepo**: bsh-mfe (Angular micro-frontends)
- **Architecture**: Module Federation with @angular-architects/native-federation
- **Target**: Angular v22 standalone components
- **Build Tool**: esbuild (not webpack)
- **Package Manager**: pnpm

### **Memory & Context**
- All previous work documented in project memory
- Key decisions recorded (cards deprecation, etc.)
- Build error fixes documented for reference

---

## 📝 Handover Notes

**Current Session Progress**:
- ✅ Fixed 94 → 0 build errors
- ✅ Completed save-and-invest standalone migration
- ✅ Deprecated cards module
- ✅ Created comprehensive migration plan

**Next AI Assistant Should**:
1. Start with upload-docs shared module
2. Follow the migration template provided
3. Maintain 0 error build standard
4. Update progress tracking as work completes
5. Document any new patterns or issues discovered

**Final Objective**: Complete Angular 22 standalone migration for customer360 MFE with full functionality and 0 build errors.

---

**Handover Created**: 2026-07-09  
**Migration Progress**: ~4% complete (1/27 modules)  
**Next Priority**: upload-docs shared module  
**Success Target**: 100% standalone Angular 22 architecture

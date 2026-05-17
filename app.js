// Image Converter Pro - Main Application Logic

class ImageConverter {
    constructor() {
        this.images = [];
        this.convertedImages = [];
        this.currentPreset = 'none';
        this.presetSizes = this.initializePresets();
        this.userPresets = this.loadUserPresets();
        this.conversionHistory = this.loadHistory();
        this.customSizesList = []; // User-defined custom sizes
        this.editingSizeIndex = null; // Index of size being edited
        this.initializeElements();
        this.setupEventListeners();
        this.checkFormatSupport();
        this.setupKeyboardShortcuts();
        this.loadThemePreference();
    }

    initializePresets() {
        return {
            'none': [],
            'custom-list': [], // Custom size list - user builds this
            'logo': [
                { width: 512, height: 512, name: '512x512' },
                { width: 256, height: 256, name: '256x256' },
                { width: 128, height: 128, name: '128x128' },
                { width: 64, height: 64, name: '64x64' },
                { width: 32, height: 32, name: '32x32' }
            ],
            'favicon': [
                { width: 16, height: 16, name: '16x16' },
                { width: 32, height: 32, name: '32x32' },
                { width: 48, height: 48, name: '48x48' },
                { width: 64, height: 64, name: '64x64' }
            ],
            'android': [
                { width: 48, height: 48, name: 'mdpi_48x48' },
                { width: 72, height: 72, name: 'hdpi_72x72' },
                { width: 96, height: 96, name: 'xhdpi_96x96' },
                { width: 144, height: 144, name: 'xxhdpi_144x144' },
                { width: 192, height: 192, name: 'xxxhdpi_192x192' },
                { width: 512, height: 512, name: 'playstore_512x512' }
            ],
            'ios': [
                { width: 60, height: 60, name: '60x60' },
                { width: 120, height: 120, name: '120x120' },
                { width: 180, height: 180, name: '180x180' },
                { width: 1024, height: 1024, name: 'appstore_1024x1024' }
            ],
            'social': [
                { width: 1080, height: 1080, name: 'instagram_1080x1080' },
                { width: 1200, height: 630, name: 'facebook_1200x630' },
                { width: 1280, height: 720, name: 'youtube_1280x720' },
                { width: 1200, height: 675, name: 'twitter_1200x675' }
            ],
            'all': [
                { width: 512, height: 512, name: '512x512' },
                { width: 256, height: 256, name: '256x256' },
                { width: 128, height: 128, name: '128x128' },
                { width: 64, height: 64, name: '64x64' },
                { width: 32, height: 32, name: '32x32' },
                { width: 16, height: 16, name: '16x16' },
                { width: 1024, height: 1024, name: '1024x1024' },
                { width: 192, height: 192, name: '192x192' },
                { width: 180, height: 180, name: '180x180' },
                { width: 144, height: 144, name: '144x144' },
                { width: 120, height: 120, name: '120x120' },
                { width: 96, height: 96, name: '96x96' },
                { width: 72, height: 72, name: '72x72' },
                { width: 60, height: 60, name: '60x60' },
                { width: 48, height: 48, name: '48x48' }
            ]
        };
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.mainDashboard = document.getElementById('mainDashboard');
        this.imagesGridSection = document.getElementById('imagesGridSection');
        this.gridContainer = document.getElementById('gridContainer');
        this.progressSection = document.getElementById('progressSection');
        this.progressContainer = document.getElementById('progressContainer');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.outputFormat = document.getElementById('outputFormat');
        this.quality = document.getElementById('quality');
        this.qualityValue = document.getElementById('qualityValue');
        this.resizeMode = document.getElementById('resizeMode');
        this.resizeWidth = document.getElementById('resizeWidth');
        this.resizeHeight = document.getElementById('resizeHeight');
        this.resizeDimensions = document.getElementById('resizeDimensions');
        this.keepAspectRatio = document.getElementById('keepAspectRatio');
        this.preserveTransparency = document.getElementById('preserveTransparency');
        this.removeMetadata = document.getElementById('removeMetadata');
        this.zipFormat = document.getElementById('zipFormat');
        this.presetButtons = document.querySelectorAll('.preset-btn');
        this.presetInfo = document.getElementById('presetInfo');
        this.autoSharpening = document.getElementById('autoSharpening');
        this.resizeType = document.getElementById('resizeType');
        this.pixelDimensions = document.getElementById('pixelDimensions');
        this.percentageDimensions = document.getElementById('percentageDimensions');
        this.resizePercentage = document.getElementById('resizePercentage');
        this.percentageValue = document.getElementById('percentageValue');
        this.customNaming = document.getElementById('customNaming');
        this.customNamingPattern = document.getElementById('customNamingPattern');
        this.folderImport = document.getElementById('folderImport');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle?.querySelector('.theme-icon');
        this.imageCount = document.getElementById('imageCount');
        this.shortcutsBtn = document.getElementById('shortcutsBtn');
        this.shortcutsPanel = document.getElementById('shortcutsPanel');
        this.presetModal = document.getElementById('presetModal');
        this.presetName = document.getElementById('presetName');
        this.savePresetConfirmBtn = document.getElementById('savePresetConfirmBtn');
        this.cancelPresetBtn = document.getElementById('cancelPresetBtn');

        // Background groups and others might be missing in new HTML, handle gracefully
        this.backgroundColorGroup = document.getElementById('backgroundColorGroup') || { style: {} };
        this.backgroundColor = document.getElementById('backgroundColor') || { value: '#ffffff' };

        // Critical: Initialize potentially missing elements to null if not found
        this.folderInput = document.getElementById('folderInput');
        this.convertMultipleFormats = document.getElementById('convertMultipleFormats');
        this.formatOptions = document.querySelectorAll('.format-option');
        this.autoPadding = document.getElementById('autoPadding');
        this.autoBackground = document.getElementById('autoBackground');
        this.cropShape = document.getElementById('cropShape');
        this.dpi = document.getElementById('dpi');

        // Resize and advanced options groups
        this.maxFileSizeGroup = document.getElementById('maxFileSizeGroup');
        this.maxDimensionsGroup = document.getElementById('maxDimensionsGroup');
        this.zipOptionsGroup = document.getElementById('zipOptionsGroup');
        this.formatSelection = document.querySelector('.format-selection') || { style: {} };
        this.customSizeListSection = document.getElementById('customSizeListSection');
        this.advancedOptions = document.getElementById('advancedOptions');

        // Missing inputs
        this.maxFileSize = document.getElementById('maxFileSize');
        this.maxWidth = document.getElementById('maxWidth');
        this.maxHeight = document.getElementById('maxHeight');

        // New Background Fill Elements
        this.backgroundFillMode = document.getElementById('backgroundFillMode');
        this.bgColorControls = document.getElementById('bgColorControls');
        this.bgImageControls = document.getElementById('bgImageControls');
        this.bgImageInput = document.getElementById('bgImageInput');
        this.bgImageBtn = document.getElementById('bgImageBtn');
        this.bgImagePreview = document.getElementById('bgImagePreview');
        this.customBgImage = null; // Store the uploaded background image object

        // Button groups
        this.percentButtons = document.querySelectorAll('.percent-btn');
        this.bgPresetButtons = document.querySelectorAll('.bg-preset-btn');

        // Custom Size List UI
        this.customSizesListContainer = document.getElementById('customSizesListContainer');
        this.addSizeBtn = document.getElementById('addSizeBtn');
        this.newSizeWidth = document.getElementById('newSizeWidth');
        this.newSizeHeight = document.getElementById('newSizeHeight');
        this.newSizeKeepAspect = document.getElementById('newSizeKeepAspect');
        this.clearSizeListBtn = document.getElementById('clearSizeListBtn');
        this.saveSizeListPresetBtn = document.getElementById('saveSizeListPresetBtn');

        // Edit Modal UI
        this.editSizeModal = document.getElementById('editSizeModal');
        this.editSizeWidth = document.getElementById('editSizeWidth');
        this.editSizeHeight = document.getElementById('editSizeHeight');
        this.editSizeFormat = document.getElementById('editSizeFormat');
        this.editSizeQuality = document.getElementById('editSizeQuality');
        this.editQualityValue = document.getElementById('editQualityValue');
        this.editSizeKeepAspect = document.getElementById('editSizeKeepAspect');
        this.editSizeBackground = document.getElementById('editSizeBackground');
        this.editSizeResizeMode = document.getElementById('editSizeResizeMode');
        this.saveSizeEditBtn = document.getElementById('saveSizeEditBtn');
        this.cancelSizeEditBtn = document.getElementById('cancelSizeEditBtn');

        // Extra buttons
        this.savePresetBtn = document.getElementById('savePresetBtn');
        this.historyBtn = document.getElementById('historyBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historySection = document.getElementById('historySection');

        // User Presets (Missing in HTML)
        this.userPresetsList = document.getElementById('userPresetsList');
        this.userPresetsSection = document.getElementById('userPresetsSection');

        // Settings Panel (Class in HTML)
        this.settingsPanel = document.querySelector('.settings-panel');
        this.imagesGrid = document.querySelector('.images-grid') || document.getElementById('imagesGridSection');

        // Watermark Controls
        this.addWatermark = document.getElementById('addWatermark');
        this.watermarkSettings = document.getElementById('watermarkSettings');
        this.watermarkText = document.getElementById('watermarkText');
        this.watermarkColor = document.getElementById('watermarkColor');
        this.watermarkOpacity = document.getElementById('watermarkOpacity');
        this.watermarkOpacityValue = document.getElementById('watermarkOpacityValue');
        this.watermarkOpacityValue = document.getElementById('watermarkOpacityValue');
        this.watermarkPosition = document.getElementById('watermarkPosition');

        // Image Filters
        this.filterBrightness = document.getElementById('filterBrightness');
        this.filterContrast = document.getElementById('filterContrast');
        this.filterSaturation = document.getElementById('filterSaturation');
        this.filterWarmth = document.getElementById('filterWarmth');
        this.filterSharpening = document.getElementById('filterSharpening');
        this.filterGrayscale = document.getElementById('filterGrayscale');
        this.filterSepia = document.getElementById('filterSepia');

        this.brightnessValue = document.getElementById('brightnessValue');
        this.contrastValue = document.getElementById('contrastValue');
        this.saturationValue = document.getElementById('saturationValue');
        this.warmthValue = document.getElementById('warmthValue');
        this.sharpeningValue = document.getElementById('sharpeningValue');

        // Notifications
        this.toastContainer = document.getElementById('toastContainer');
    }

    initializePresets() {
        return {
            'none': [],
            'custom-list': [], // Custom size list - user builds this
            'logo': [
                { width: 512, height: 512, name: '512x512' },
                { width: 256, height: 256, name: '256x256' },
                { width: 128, height: 128, name: '128x128' },
                { width: 64, height: 64, name: '64x64' },
                { width: 32, height: 32, name: '32x32' }
            ],
            'favicon': [
                { width: 16, height: 16, name: '16x16' },
                { width: 32, height: 32, name: '32x32' },
                { width: 48, height: 48, name: '48x48' },
                { width: 64, height: 64, name: '64x64' }
            ],
            'android': [
                { width: 48, height: 48, name: 'mdpi_48x48' },
                { width: 72, height: 72, name: 'hdpi_72x72' },
                { width: 96, height: 96, name: 'xhdpi_96x96' },
                { width: 144, height: 144, name: 'xxhdpi_144x144' },
                { width: 192, height: 192, name: 'xxxhdpi_192x192' },
                { width: 512, height: 512, name: 'playstore_512x512' }
            ],
            'ios': [
                { width: 60, height: 60, name: '60x60' },
                { width: 120, height: 120, name: '120x120' },
                { width: 180, height: 180, name: '180x180' },
                { width: 1024, height: 1024, name: 'appstore_1024x1024' }
            ],
            'social': [
                { width: 1080, height: 1080, name: 'instagram_1080x1080' },
                { width: 1200, height: 630, name: 'facebook_1200x630' },
                { width: 1280, height: 720, name: 'youtube_1280x720' },
                { width: 1200, height: 675, name: 'twitter_1200x675' }
            ],
            'all': [
                { width: 512, height: 512, name: '512x512' },
                { width: 256, height: 256, name: '256x256' },
                { width: 128, height: 128, name: '128x128' },
                { width: 64, height: 64, name: '64x64' },
                { width: 32, height: 32, name: '32x32' },
                { width: 16, height: 16, name: '16x16' },
                { width: 1024, height: 1024, name: '1024x1024' },
                { width: 192, height: 192, name: '192x192' },
                { width: 180, height: 180, name: '180x180' },
                { width: 144, height: 144, name: '144x144' },
                { width: 120, height: 120, name: '120x120' },
                { width: 96, height: 96, name: '96x96' },
                { width: 72, height: 72, name: '72x72' },
                { width: 60, height: 60, name: '60x60' },
                { width: 48, height: 48, name: '48x48' }
            ]
        };
    }

    setupEventListeners() {
        // Upload area events
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => this.fileInput.click());
            this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        }

        // File input
        if (this.fileInput) this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        if (this.folderInput) this.folderInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Global Paste Support
        window.addEventListener('paste', (e) => this.handlePaste(e));

        // Resize type change
        if (this.resizeType) {
            this.resizeType.addEventListener('change', (e) => {
                const type = e.target.value;
                if (this.pixelDimensions) this.pixelDimensions.style.display = type === 'pixels' ? 'block' : 'none';
                if (this.percentageDimensions) this.percentageDimensions.style.display = type === 'percentage' ? 'block' : 'none';
                if (this.maxFileSizeGroup) this.maxFileSizeGroup.style.display = type === 'maxfilesize' ? 'block' : 'none';
                if (this.maxDimensionsGroup) this.maxDimensionsGroup.style.display = type === 'maxdimensions' ? 'block' : 'none';
            });
        }

        // Percentage slider
        if (this.resizePercentage) {
            this.resizePercentage.addEventListener('input', (e) => {
                if (this.percentageValue) this.percentageValue.textContent = e.target.value;
            });
        }

        // Percentage preset buttons
        this.percentButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const percent = e.target.dataset.percent;
                if (this.resizePercentage) this.resizePercentage.value = percent;
                if (this.percentageValue) this.percentageValue.textContent = percent;
            });
        });

        // Multiple formats
        if (this.convertMultipleFormats) {
            this.convertMultipleFormats.addEventListener('change', (e) => {
                if (this.formatSelection) this.formatSelection.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Custom naming
        if (this.customNaming) {
            this.customNaming.addEventListener('change', (e) => {
                if (this.customNamingPattern) this.customNamingPattern.style.display = e.target.value === 'custom' ? 'block' : 'none';
            });
        }

        // ZIP format change
        if (this.zipFormat) {
            this.zipFormat.addEventListener('change', (e) => {
                if (this.zipOptionsGroup) this.zipOptionsGroup.style.display = e.target.value === 'zip' ? 'block' : 'none';
            });
        }

        // Folder import
        if (this.folderImport) {
            this.folderImport.addEventListener('change', (e) => {
                if (this.fileInput) {
                    if (e.target.checked) {
                        this.fileInput.setAttribute('webkitdirectory', '');
                    } else {
                        this.fileInput.removeAttribute('webkitdirectory');
                    }
                }
            });
        }

        // Preset buttons
        if (this.savePresetBtn) this.savePresetBtn.addEventListener('click', () => this.showPresetModal());
        if (this.savePresetConfirmBtn) this.savePresetConfirmBtn.addEventListener('click', () => this.saveCurrentPreset());
        if (this.cancelPresetBtn) this.cancelPresetBtn.addEventListener('click', () => this.closePresetModal());
        if (this.historyBtn) this.historyBtn.addEventListener('click', () => this.toggleHistory());
        if (this.clearHistoryBtn) this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Custom size list
        if (this.addSizeBtn) this.addSizeBtn.addEventListener('click', () => this.addCustomSize());
        if (this.newSizeWidth) this.newSizeWidth.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addCustomSize(); });
        if (this.newSizeHeight) this.newSizeHeight.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addCustomSize(); });
        if (this.clearSizeListBtn) this.clearSizeListBtn.addEventListener('click', () => this.clearCustomSizesList());
        if (this.saveSizeListPresetBtn) this.saveSizeListPresetBtn.addEventListener('click', () => this.saveSizeListAsPreset());
        if (this.saveSizeEditBtn) this.saveSizeEditBtn.addEventListener('click', () => this.saveSizeEdit());
        if (this.cancelSizeEditBtn) this.cancelSizeEditBtn.addEventListener('click', () => this.closeSizeEditModal());
        if (this.editSizeQuality) {
            this.editSizeQuality.addEventListener('input', (e) => {
                if (this.editQualityValue) this.editQualityValue.textContent = e.target.value;
            });
        }

        // Close modals on outside click
        if (this.presetModal) {
            this.presetModal.addEventListener('click', (e) => {
                if (e.target === this.presetModal) {
                    this.closePresetModal();
                }
            });
        }
        if (this.editSizeModal) {
            this.editSizeModal.addEventListener('click', (e) => {
                if (e.target === this.editSizeModal) {
                    this.closeSizeEditModal();
                }
            });
        }

        // Settings
        if (this.quality) {
            this.quality.addEventListener('input', (e) => {
                if (this.qualityValue) this.qualityValue.textContent = e.target.value;
            });
        }

        if (this.resizeMode) {
            this.resizeMode.addEventListener('change', (e) => {
                const showDimensions = e.target.value === 'custom' || e.target.value === 'fit' || e.target.value === 'fill';
                if (this.resizeDimensions) this.resizeDimensions.style.display = showDimensions ? 'block' : 'none';
                if (this.resizeHeightGroup) this.resizeHeightGroup.style.display = showDimensions ? 'block' : 'none';
            });
        }

        if (this.outputFormat) {
            this.outputFormat.addEventListener('change', (e) => {
                const format = e.target.value;
                const needsBackground = format === 'jpg' || format === 'jpeg';
                if (this.backgroundColorGroup) this.backgroundColorGroup.style.display = needsBackground ? 'block' : 'none';
                
                // Dynamically update ZIP format labels when PDF is selected
                if (this.zipFormat && this.zipFormat.options && this.zipFormat.options.length >= 2) {
                    if (format === 'pdf') {
                        this.zipFormat.options[0].textContent = 'Consolidated Multi-page PDF';
                        this.zipFormat.options[1].textContent = 'Batch Individual PDFs';
                    } else {
                        this.zipFormat.options[0].textContent = 'Single ZIP Archive';
                        this.zipFormat.options[1].textContent = 'Batch Individual Downloads';
                    }
                }
            });
        }

        if (this.resizeMode) {
            this.resizeMode.addEventListener('change', (e) => {
                const isCircular = e.target.value === 'circular';
                if (this.advancedOptions) this.advancedOptions.style.display = isCircular ? 'block' : 'none';
            });
        }

        // Preset buttons
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.selectPreset(preset);
            });
        });

        // Background color preset buttons
        this.bgPresetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                if (color === 'transparent') {
                    if (this.preserveTransparency) this.preserveTransparency.checked = true;
                    if (this.outputFormat) this.outputFormat.value = 'png';
                } else {
                    if (this.backgroundColor) this.backgroundColor.value = color;
                }
            });
        });

        // Background Fill Mode toggle
        if (this.backgroundFillMode) {
            this.backgroundFillMode.addEventListener('change', (e) => {
                const mode = e.target.value;
                if (this.bgColorControls) this.bgColorControls.style.display = mode === 'color' ? 'flex' : 'none';
                if (this.bgImageControls) this.bgImageControls.style.display = mode === 'image' ? 'block' : 'none';
            });
        }

        // Background Image Upload
        if (this.bgImageBtn) this.bgImageBtn.addEventListener('click', () => this.bgImageInput.click());
        if (this.bgImageInput) {
            this.bgImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            this.customBgImage = img;
                            if (this.bgImagePreview) {
                                this.bgImagePreview.style.display = 'block';
                                this.bgImagePreview.textContent = `BG: ${file.name}`;
                            }
                            this.showNotification('Background image loaded!', 'success');
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Auto Background toggle visibility
        if (this.autoBackground) {
            this.autoBackground.addEventListener('change', () => this.updateBackgroundVisibility());
        }

        // Action buttons
        if (this.convertBtn) this.convertBtn.addEventListener('click', () => this.convertAll());
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearAll());
        if (this.downloadAllBtn) this.downloadAllBtn.addEventListener('click', () => this.downloadAll());

        // Theme toggle
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Load saved theme preference
        this.loadThemePreference();

        // Initial format check
        if (this.outputFormat) {
            this.outputFormat.addEventListener('change', () => this.updateBackgroundVisibility());
        }

        // Final initialization
        this.updateBackgroundVisibility();
        if (this.resizeType) this.resizeType.dispatchEvent(new Event('change'));
        if (this.zipFormat) this.zipFormat.dispatchEvent(new Event('change'));
        this.selectPreset('none');
        this.updateUserPresetsUI();
    }

    updateBackgroundVisibility() {
        const format = this.outputFormat ? this.outputFormat.value : 'png';
        const needsBackground = format === 'jpg' || format === 'jpeg';
        const isAutoBg = this.autoBackground && this.autoBackground.checked;

        if (this.backgroundColorGroup) {
            this.backgroundColorGroup.style.display = (needsBackground || isAutoBg) ? 'block' : 'none';
        }

        if (this.backgroundFillMode) {
            const mode = this.backgroundFillMode.value;
            if (this.bgColorControls) this.bgColorControls.style.display = (mode === 'color') ? 'flex' : 'none';
            if (this.bgImageControls) this.bgImageControls.style.display = (mode === 'image') ? 'block' : 'none';
        }
    }



    updateThemeIcon(isLight) {
        if (this.themeIcon) {
            this.themeIcon.textContent = isLight ? '☀️' : '🌙';
        }
    }

    setupKeyboardShortcuts() {
        // Toggle Shortcuts Panel
        if (this.shortcutsBtn) {
            this.shortcutsBtn.addEventListener('click', () => {
                this.shortcutsPanel.classList.toggle('active');
            });
        }

        document.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && e.key === 'u') {
                e.preventDefault();
                this.fileInput.click();
            } else if (ctrl && e.key === 'Enter') {
                e.preventDefault();
                this.convertBtn.click();
            } else if (ctrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.clearAll();
            } else if (ctrl && e.key === 'd') {
                e.preventDefault();
                if (this.convertedImages.length > 0) {
                    this.downloadAll();
                }
            } else if (ctrl && e.key === 'h') {
                e.preventDefault();
                this.toggleHistory();
            } else if (e.key === 'Escape') {
                this.closePresetModal();
                this.historySection.style.display = 'none';
            }
        });
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('imageConverter_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // If saved as light, or no save and user prefers light
        if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
            document.body.classList.add('light-theme');
            this.updateThemeIcon(true);
        } else {
            document.body.classList.remove('light-theme');
            this.updateThemeIcon(false);
        }

        // Listen for system theme changes if no manual preference is set
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('imageConverter_theme')) {
                const isLightNow = !e.matches;
                document.body.classList.toggle('light-theme', isLightNow);
                this.updateThemeIcon(isLightNow);
            }
        });
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        this.updateThemeIcon(isLight);
        localStorage.setItem('imageConverter_theme', isLight ? 'light' : 'dark');
    }

    loadUserPresets() {
        try {
            const saved = localStorage.getItem('imageConverter_userPresets');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    saveUserPresets() {
        try {
            localStorage.setItem('imageConverter_userPresets', JSON.stringify(this.userPresets));
        } catch (e) {
            console.error('Failed to save presets:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('imageConverter_history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveHistory() {
        try {
            // Keep only last 10
            const history = this.conversionHistory.slice(-10);
            localStorage.setItem('imageConverter_history', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    selectPreset(preset) {
        this.currentPreset = preset;

        // Update button states
        this.presetButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === preset);
        });

        // Show/hide custom size list section
        if (preset === 'custom-list') {
            if (this.customSizeListSection) this.customSizeListSection.style.display = 'block';
            if (this.presetInfo) {
                this.presetInfo.innerHTML = `
                    <strong>Custom Size List Mode</strong><br>
                    <small>💡 Add any sizes you want, then generate them all at once</small>
                `;
            }
        } else {
            if (this.customSizeListSection) this.customSizeListSection.style.display = 'none';
        }

        // Update preset info
        const sizes = this.presetSizes[preset];
        if (preset === 'none') {
            if (this.presetInfo) this.presetInfo.textContent = 'Using custom dimensions or no resize';
            if (this.resizeWidth) this.resizeWidth.disabled = false;
            if (this.resizeHeight) this.resizeHeight.disabled = false;
            if (this.resizeDimensions) this.resizeDimensions.style.display = 'block';
            if (this.resizeHeightGroup) this.resizeHeightGroup.style.display = 'block';
        } else if (preset === 'custom-list') {
            // Already handled above
        } else {
            const sizesList = sizes.map(s => `${s.name || s.width + 'x' + s.height}`).join(', ');
            const count = sizes.length;
            if (this.presetInfo) {
                this.presetInfo.innerHTML = `
                    <strong>${count} sizes will be generated:</strong><br>
                    ${sizesList}<br>
                    <small>💡 Each uploaded image will generate ${count} resized versions automatically</small>
                `;
            }
            if (this.resizeWidth) this.resizeWidth.disabled = true;
            if (this.resizeHeight) this.resizeHeight.disabled = true;
            if (this.resizeDimensions) this.resizeDimensions.style.display = 'none';
            if (this.resizeHeightGroup) this.resizeHeightGroup.style.display = 'none';
            // Auto-set resize mode to fit for presets
            if (this.resizeMode.value === 'none') {
                this.resizeMode.value = 'fit';
            }
        }
    }

    addCustomSize() {
        const width = parseInt(this.newSizeWidth.value);
        const height = parseInt(this.newSizeHeight.value);
        const keepAspect = this.newSizeKeepAspect.checked;

        if (!width && !height) {
            this.showNotification('Please enter at least width or height', 'error');
            return;
        }

        const newSize = {
            width: width || null,
            height: height || null,
            keepAspect: keepAspect,
            format: this.outputFormat.value,
            quality: parseInt(this.quality.value),
            backgroundColor: this.backgroundColor.value,
            resizeMode: this.resizeMode.value || 'fit',
            name: `${width || 'auto'}x${height || 'auto'}`
        };

        this.customSizesList.push(newSize);
        this.updateCustomSizesListUI();
        this.showNotification('Custom size added!', 'success');

        // Clear inputs
        this.newSizeWidth.value = '';
        this.newSizeHeight.value = '';
        this.newSizeKeepAspect.checked = false;
    }

    removeCustomSize(index) {
        this.customSizesList.splice(index, 1);
        this.updateCustomSizesListUI();
        this.showNotification('Custom size removed!', 'info');
    }

    editCustomSize(index) {
        const size = this.customSizesList[index];
        this.editingSizeIndex = index;

        this.editSizeWidth.value = size.width || '';
        this.editSizeHeight.value = size.height || '';
        this.editSizeFormat.value = size.format || 'png';
        this.editSizeQuality.value = size.quality || 80;
        this.editQualityValue.textContent = size.quality || 80;
        this.editSizeKeepAspect.checked = size.keepAspect || false;
        this.editSizeBackground.value = size.backgroundColor || '#ffffff';
        this.editSizeResizeMode.value = size.resizeMode || 'fit';

        this.editSizeModal.style.display = 'flex';
    }

    saveSizeEdit() {
        if (this.editingSizeIndex === null) return;

        const size = this.customSizesList[this.editingSizeIndex];
        size.width = parseInt(this.editSizeWidth.value) || null;
        size.height = parseInt(this.editSizeHeight.value) || null;
        size.format = this.editSizeFormat.value;
        size.quality = parseInt(this.editSizeQuality.value);
        size.keepAspect = this.editSizeKeepAspect.checked;
        size.backgroundColor = this.editSizeBackground.value;
        size.resizeMode = this.editSizeResizeMode.value;
        size.name = `${size.width || 'auto'}x${size.height || 'auto'}`;

        this.updateCustomSizesListUI();
        this.closeSizeEditModal();
        this.showNotification('Custom size updated!', 'success');
    }

    closeSizeEditModal() {
        this.editSizeModal.style.display = 'none';
        this.editingSizeIndex = null;
        // Watermark toggle
        if (this.addWatermark) {
            this.addWatermark.addEventListener('change', (e) => {
                if (this.watermarkSettings) {
                    this.watermarkSettings.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }

        if (this.watermarkOpacity) {
            this.watermarkOpacity.addEventListener('input', (e) => {
                if (this.watermarkOpacityValue) this.watermarkOpacityValue.textContent = e.target.value;
            });
        }

        // Filter value updates
        if (this.filterBrightness) {
            this.filterBrightness.addEventListener('input', (e) => {
                if (this.brightnessValue) this.brightnessValue.textContent = e.target.value;
            });
        }
        if (this.filterContrast) {
            this.filterContrast.addEventListener('input', (e) => {
                if (this.contrastValue) this.contrastValue.textContent = e.target.value;
            });
        }
        if (this.filterSaturation) {
            this.filterSaturation.addEventListener('input', (e) => {
                if (this.saturationValue) this.saturationValue.textContent = e.target.value;
            });
        }
        if (this.filterWarmth) {
            this.filterWarmth.addEventListener('input', (e) => {
                if (this.warmthValue) this.warmthValue.textContent = e.target.value;
            });
        }
        if (this.filterSharpening) {
            this.filterSharpening.addEventListener('input', (e) => {
                if (this.sharpeningValue) this.sharpeningValue.textContent = e.target.value;
            });
        }
    }

    clearCustomSizesList() {
        if (this.customSizesList.length === 0) return;
        if (confirm(`Clear all ${this.customSizesList.length} custom sizes?`)) {
            this.customSizesList = [];
            this.updateCustomSizesListUI();
            this.showNotification('Custom size list cleared!', 'info');
        }
    }

    updateCustomSizesListUI() {
        if (this.customSizesList.length === 0) {
            this.customSizesListContainer.innerHTML = '<p class="empty-message">No custom sizes added yet. Click "+ Add Size" to start building your list.</p>';
            return;
        }

        this.customSizesListContainer.innerHTML = this.customSizesList.map((size, index) => {
            const width = size.width || 'Auto';
            const height = size.height || 'Auto';
            return `
                <div class="custom-size-item">
                    <div class="size-item-info">
                        <div class="size-item-main">
                            <span class="size-item-dimensions">${width} × ${height}px</span>
                            ${size.keepAspect ? '<span style="color: var(--text-secondary); font-size: 0.9rem;">(Aspect ratio)</span>' : ''}
                        </div>
                        <div class="size-item-details">
                            <span>Format: ${size.format.toUpperCase()}</span>
                            <span>Quality: ${size.quality}%</span>
                            <span>Mode: ${size.resizeMode}</span>
                        </div>
                    </div>
                    <div class="size-item-actions">
                        <button class="btn-icon" onclick="window.imageConverter.editCustomSize(${index})" title="Edit">✏️</button>
                        <button class="btn-icon danger" onclick="window.imageConverter.removeCustomSize(${index})" title="Remove">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    saveSizeListAsPreset() {
        if (this.customSizesList.length === 0) {
            this.showNotification('Please add some custom sizes first', 'error');
            return;
        }

        const name = prompt('Enter preset name:', 'My Custom Sizes');
        if (!name || !name.trim()) {
            this.showNotification('Preset name cannot be empty', 'error');
            return;
        }

        const preset = {
            name: name.trim(),
            type: 'custom-size-list',
            sizes: JSON.parse(JSON.stringify(this.customSizesList)),
            timestamp: Date.now()
        };

        this.userPresets[name.trim()] = preset;
        this.saveUserPresets();
        this.updateUserPresetsUI();
        this.showNotification(`Preset "${name.trim()}" saved! You can load it from "Your Custom Presets" section.`, 'success');
    }

    checkFormatSupport() {
        // Check WebP support
        const webpSupported = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
        if (!webpSupported) {
            const webpOption = this.outputFormat.querySelector('option[value="webp"]');
            if (webpOption) {
                webpOption.disabled = true;
                webpOption.textContent += ' (not supported)';
            }
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/') || file.type === 'application/pdf' || file.name.endsWith('.pdf')
        );
        this.handleFiles(files);
    }

    handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const file = new File([blob], `pasted_image_${Date.now()}_${i}.png`, { type: blob.type });
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            this.handleFiles(files);
        }
    }

    async handleFiles(files) {
        if (files.length === 0) return;

        let hasValidImage = false;
        let pdfPagesLoaded = 0;

        for (const file of files) {
            // Support PDFs
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                try {
                    this.showNotification(`Parsing PDF: ${file.name}...`, 'info');
                    const pdfImages = await this.loadPdfPages(file);
                    this.images.push(...pdfImages);
                    hasValidImage = true;
                    pdfPagesLoaded += pdfImages.length;
                } catch (error) {
                    console.error('Error loading PDF:', error);
                    this.showNotification(`Error loading PDF ${file.name}: ${error.message}`, 'error');
                }
                continue;
            }

            if (!file.type.match('image.*') && !file.name.endsWith('.svg')) {
                this.showNotification(`Skipped unsupported file: ${file.name}`, 'error');
                continue;
            }

            try {
                const imageData = await this.loadImage(file);
                this.images.push(imageData);
                hasValidImage = true;
            } catch (error) {
                console.error('Error loading image:', error);
                this.showNotification(`Error loading ${file.name}: ${error.message}`, 'error');
            }
        }

        if (hasValidImage) {
            if (pdfPagesLoaded > 0) {
                this.showNotification(`Loaded ${pdfPagesLoaded} pages from PDF!`, 'success');
            } else {
                this.showNotification(`${files.length} file(s) loaded`, 'success');
            }
        }
        this.updateUI();
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    resolve({
                        file: file,
                        name: file.name,
                        originalSize: file.size,
                        width: img.width,
                        height: img.height,
                        image: img,
                        format: this.detectFormat(file.name, file.type),
                        hasTransparency: this.checkTransparency(img)
                    });
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    loadPdfPages(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    const pagesCount = pdf.numPages;
                    const pdfImages = [];
                    
                    for (let pageNum = 1; pageNum <= pagesCount; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        
                        // Render at 2x scale for premium crisp images!
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext('2d');
                        
                        await page.render({
                            canvasContext: ctx,
                            viewport: viewport
                        }).promise;
                        
                        const dataUrl = canvas.toDataURL('image/png');
                        const img = new Image();
                        
                        await new Promise((imgResolve, imgReject) => {
                            img.onload = imgResolve;
                            img.onerror = imgReject;
                            img.src = dataUrl;
                        });
                        
                        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        const pageName = `${nameWithoutExt}_page_${pageNum}.png`;
                        const blob = this.dataURLtoBlob(dataUrl);
                        
                        pdfImages.push({
                            file: new File([blob], pageName, { type: 'image/png' }),
                            name: pageName,
                            originalSize: blob.size,
                            width: img.width,
                            height: img.height,
                            image: img,
                            format: 'png',
                            hasTransparency: false
                        });
                    }
                    resolve(pdfImages);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read PDF file'));
            reader.readAsArrayBuffer(file);
        });
    }

    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    detectFormat(filename, mimeType) {
        const ext = filename.split('.').pop().toLowerCase();
        const formatMap = {
            'png': 'png',
            'jpg': 'jpg',
            'jpeg': 'jpeg',
            'webp': 'webp',
            'bmp': 'bmp',
            'gif': 'gif',
            'tiff': 'tiff',
            'svg': 'svg',
            'avif': 'avif',
            'heic': 'heic'
        };
        return formatMap[ext] || mimeType.split('/')[1] || 'unknown';
    }

    checkTransparency(img) {
        try {
            const canvas = document.createElement('canvas');
            // Use a small scale for performance, but large enough to detect details
            const size = Math.min(img.width, img.height, 100);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);

            const imageData = ctx.getImageData(0, 0, size, size).data;
            for (let i = 3; i < imageData.length; i += 4) {
                if (imageData[i] < 255) {
                    return true;
                }
            }
        } catch (e) {
            console.warn('Could not check transparency:', e);
        }
        return false;
    }

    updateUI() {
        if (this.images.length > 0) {
            if (this.mainDashboard) this.mainDashboard.style.display = 'block';
            if (this.settingsPanel) this.settingsPanel.style.display = 'block';
            if (this.imagesGrid) this.imagesGrid.style.display = 'block';
            this.updateImageGrid();
        }
    }

    updateImageGrid() {
        this.gridContainer.innerHTML = '';
        this.imageCount.textContent = this.images.length;

        this.images.forEach((imageData, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';

            // Create a removal button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'delete-image-btn';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Remove Image';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeImage(index);
            };

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 200;

            // Draw preview
            const scale = Math.min(canvas.width / imageData.width, canvas.height / imageData.height);
            const x = (canvas.width - imageData.width * scale) / 2;
            const y = (canvas.height - imageData.height * scale) / 2;
            ctx.drawImage(imageData.image, x, y, imageData.width * scale, imageData.height * scale);

            const img = document.createElement('img');
            img.className = 'image-preview';
            img.src = canvas.toDataURL();

            const previewContainer = document.createElement('div');
            previewContainer.className = 'image-preview-container';
            previewContainer.appendChild(img);
            previewContainer.appendChild(removeBtn);

            const info = document.createElement('div');
            info.className = 'image-card-info';
            info.innerHTML = `
                <div class="image-card-name" title="${imageData.name}">${imageData.name}</div>
                <div class="image-card-meta">
                    <div class="meta-row">
                        <span>Format</span>
                        <span class="badge border-red">${imageData.format.toUpperCase()}</span>
                    </div>
                    <div class="meta-row">
                        <span>Dims</span>
                        <span class="badge">${imageData.width}×${imageData.height}</span>
                    </div>
                    <div class="meta-row">
                        <span>Size</span>
                        <span>${this.formatFileSize(imageData.originalSize)}</span>
                    </div>
                </div>
            `;

            card.appendChild(previewContainer);
            card.appendChild(info);
            this.gridContainer.appendChild(card);
        });
    }

    removeImage(index) {
        this.images.splice(index, 1);
        this.updateUI();
        this.showNotification('Image removed', 'info');

        // Hide dashboard if no images left
        if (this.images.length === 0 && this.mainDashboard) {
            this.mainDashboard.style.display = 'none';
            // Also reset input
            this.fileInput.value = '';
        }
    }

    async convertAll() {
        if (this.images.length === 0) {
            this.showNotification('Please upload images first', 'error');
            return;
        }

        this.convertedImages = [];
        this.resultsSection.style.display = 'none';
        this.progressSection.style.display = 'block';
        this.progressContainer.innerHTML = '';
        this.convertBtn.disabled = true;

        const format = this.outputFormat.value;
        const quality = this.quality.value / 100;
        let resizeMode = this.resizeMode.value;
        const bgColor = this.backgroundColor.value === 'transparent' ? null : this.backgroundColor.value;
        const preserveTrans = this.preserveTransparency.checked;
        const autoPadding = this.autoPadding ? this.autoPadding.checked : false;
        const autoSharpening = this.autoSharpening ? this.autoSharpening.checked : false;
        const cropShape = this.cropShape ? this.cropShape.value : 'rect';
        const dpi = this.dpi ? parseInt(this.dpi.value) : 72;

        // Get formats to generate
        let formatsToGenerate = (this.convertMultipleFormats && this.convertMultipleFormats.checked)
            ? Array.from(this.formatOptions).filter(opt => opt.checked).map(opt => opt.value)
            : [format];

        // Get sizes to generate based on preset
        let sizesToGenerate;
        if (this.currentPreset === 'custom-list') {
            // Use custom size list
            if (this.customSizesList.length === 0) {
                this.showNotification('Please add some custom sizes to your list first', 'error');
                if (this.convertBtn) this.convertBtn.disabled = false;
                return;
            }
            sizesToGenerate = this.customSizesList.map((size, idx) => ({
                width: size.width,
                height: size.height,
                name: size.name || `${size.width || 'auto'}x${size.height || 'auto'}`,
                format: size.format,
                quality: size.quality / 100,
                backgroundColor: size.backgroundColor,
                resizeMode: size.resizeMode,
                keepAspect: size.keepAspect
            }));
            // Use per-size formats if specified
            formatsToGenerate = [...new Set(sizesToGenerate.map(s => s.format))];
        } else if (this.currentPreset === 'none') {
            const resizeType = this.resizeType.value;

            if (resizeType === 'percentage') {
                const percentage = parseInt(this.resizePercentage.value) / 100;
                // Use first image as reference for percentage calculation
                const refImage = this.images[0];
                sizesToGenerate = [{
                    width: Math.round(refImage.width * percentage),
                    height: Math.round(refImage.height * percentage),
                    name: `${percentage * 100}%`
                }];
            } else if (resizeType === 'maxfilesize') {
                sizesToGenerate = [{ width: null, height: null, name: 'maxfilesize', maxSizeKB: parseInt(this.maxFileSize.value) }];
            } else if (resizeType === 'maxdimensions') {
                const maxW = parseInt(this.maxWidth.value);
                const maxH = parseInt(this.maxHeight.value);
                sizesToGenerate = [{ width: maxW, height: maxH, name: 'maxdimensions' }];
            } else {
                const customWidth = parseInt(this.resizeWidth.value);
                const customHeight = parseInt(this.resizeHeight.value);
                if (customWidth || customHeight) {
                    sizesToGenerate = [{ width: customWidth || null, height: customHeight || null, name: 'custom' }];
                } else {
                    sizesToGenerate = [{ width: null, height: null, name: 'original' }];
                }
            }
        } else {
            sizesToGenerate = this.presetSizes[this.currentPreset];
            // For presets, force fit mode to maintain aspect ratio
            resizeMode = 'fit';
        }

        let totalTasks = 0;
        let completedTasks = 0;

        for (let i = 0; i < this.images.length; i++) {
            const imageData = this.images[i];

            // Create progress item
            const progressItem = this.createProgressItem(imageData.name, i, sizesToGenerate.length);
            if (this.progressContainer) this.progressContainer.appendChild(progressItem);

            // Generate all sizes and formats for this image
            for (const size of sizesToGenerate) {
                // Use per-size format if available (for custom list), otherwise use format list
                const formatsForThisSize = size.format ? [size.format] : formatsToGenerate;

                for (const formatToUse of formatsForThisSize) {
                    totalTasks++;
                    const sizeName = size.name || `${size.width || 'auto'}x${size.height || 'auto'}`;

                    try {
                        let converted;

                        // Handle max file size resize
                        if (size.maxSizeKB) {
                            converted = await this.convertToMaxFileSize(
                                imageData,
                                formatToUse,
                                quality,
                                size.maxSizeKB * 1024,
                                bgColor,
                                preserveTrans,
                                sizeName,
                                (progress) => {
                                    const fill = progressItem.querySelector('.progress-fill');
                                    const currentProgress = ((completedTasks / totalTasks) * 100) + (progress / totalTasks);
                                    fill.style.width = `${currentProgress}%`;
                                    fill.textContent = `${Math.round(currentProgress)}%`;
                                }
                            );
                        } else {
                            // Use per-size settings if available (for custom list)
                            const sizeFormat = size.format || formatToUse;
                            const sizeQuality = size.quality !== undefined ? size.quality : quality;
                            const sizeResizeMode = size.resizeMode || resizeMode;
                            const sizeBgColor = size.backgroundColor || bgColor;

                            // Handle keep aspect ratio for custom sizes
                            let finalWidth = size.width;
                            let finalHeight = size.height;
                            if (size.keepAspect && (finalWidth || finalHeight)) {
                                const aspect = imageData.width / imageData.height;
                                if (finalWidth && !finalHeight) {
                                    finalHeight = Math.round(finalWidth / aspect);
                                } else if (finalHeight && !finalWidth) {
                                    finalWidth = Math.round(finalHeight * aspect);
                                }
                            }

                            converted = await this.convertImage(
                                imageData,
                                sizeFormat,
                                sizeQuality,
                                sizeResizeMode,
                                finalWidth,
                                finalHeight,
                                sizeBgColor,
                                preserveTrans,
                                autoPadding,
                                autoSharpening,
                                cropShape,
                                sizeName,
                                (progress) => {
                                    const fill = progressItem.querySelector('.progress-bar-fill');
                                    const currentProgress = ((completedTasks / totalTasks) * 100) + (progress / totalTasks);
                                    fill.style.width = `${currentProgress}%`;
                                }
                            );
                        }

                        this.convertedImages.push(converted);
                        completedTasks++;
                    } catch (error) {
                        console.error('Conversion error:', error);
                        completedTasks++;
                        this.showNotification(`Error converting ${imageData.name} to ${sizeName} (${formatToUse}): ${error.message}`, 'error');
                        // Continue with other sizes/formats even if one fails
                    }
                }
            }
        }

        if (this.convertBtn) this.convertBtn.disabled = false;
        this.addToHistory();
        this.showNotification('Processing complete!', 'success');
        this.showResults();
    }

    async convertToMaxFileSize(imageData, format, quality, maxSizeBytes, bgColor, preserveTrans, sizeName, progressCallback) {
        // Binary search for optimal quality/size
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let bestResult = null;
        const maxIterations = 10;

        for (let i = 0; i < maxIterations; i++) {
            const testQuality = (minQuality + maxQuality) / 2;
            progressCallback((i / maxIterations) * 100);

            const result = await this.convertImage(
                imageData,
                format,
                testQuality,
                'fit',
                imageData.width,
                imageData.height,
                bgColor,
                preserveTrans,
                false,
                false,
                'original',
                sizeName,
                () => { }
            );

            if (result.size <= maxSizeBytes) {
                bestResult = result;
                minQuality = testQuality;
            } else {
                maxQuality = testQuality;
            }

            if (Math.abs(result.size - maxSizeBytes) / maxSizeBytes < 0.05) {
                break; // Close enough
            }
        }

        if (!bestResult) {
            // Fallback: use minimum quality
            return await this.convertImage(
                imageData,
                format,
                0.1,
                'fit',
                imageData.width,
                imageData.height,
                bgColor,
                preserveTrans,
                false,
                false,
                'original',
                sizeName,
                progressCallback
            );
        }

        progressCallback(100);
        return bestResult;
    }

    createProgressItem(name, index, count = 1) {
        const item = document.createElement('div');
        item.className = 'progress-item fade-in';
        const statusText = count > 1 ? `Generating ${count} variations...` : 'Optimizing...';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: 500; font-size: 0.9rem;">
                <span>${name}</span>
                <span style="color: var(--primary)">${statusText}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
        `;
        return item;
    }

    async convertImage(imageData, format, quality, resizeMode, width, height, bgColor, preserveTrans, autoPadding, autoSharpening, cropShape, sizeName, progressCallback) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate dimensions
            let finalWidth = width || imageData.width;
            let finalHeight = height || imageData.height;

            // Handle auto padding for square icons
            if (autoPadding && width && height && width === height) {
                // Keep original aspect, add padding
                const scale = Math.min(width / imageData.width, height / imageData.height);
                const scaledWidth = imageData.width * scale;
                const scaledHeight = imageData.height * scale;
                const offsetX = (width - scaledWidth) / 2;
                const offsetY = (height - scaledHeight) / 2;

                canvas.width = finalWidth;
                canvas.height = finalHeight;

                // Set background
                const isAutoBg = this.autoBackground && this.autoBackground.checked && imageData.hasTransparency;
                const bgFillMode = this.backgroundFillMode ? this.backgroundFillMode.value : 'color';

                if ((format === 'jpg' || format === 'jpeg' && !preserveTrans) || (bgColor && bgColor !== 'transparent') || isAutoBg) {
                    this.applySelectedBackground(ctx, canvas.width, canvas.height, imageData, bgColor, isAutoBg, bgFillMode);
                }

                ctx.drawImage(imageData.image, offsetX, offsetY, scaledWidth, scaledHeight);
            } else {
                // Normal resize modes
                if (resizeMode === 'stretch' && width && height) {
                    finalWidth = width;
                    finalHeight = height;
                } else if (resizeMode === 'fit' && (width || height)) {
                    const scale = Math.min(
                        (width || Infinity) / imageData.width,
                        (height || Infinity) / imageData.height
                    );
                    finalWidth = Math.round(imageData.width * scale);
                    finalHeight = Math.round(imageData.height * scale);
                } else if (resizeMode === 'fill' && (width || height)) {
                    const scale = Math.max(
                        (width || 0) / imageData.width,
                        (height || 0) / imageData.height
                    );
                    finalWidth = Math.round(imageData.width * scale);
                    finalHeight = Math.round(imageData.height * scale);
                } else if (resizeMode === 'circular' && width && height) {
                    finalWidth = Math.min(width, height);
                    finalHeight = finalWidth; // Make square for circle
                } else if (!width && !height) {
                    finalWidth = imageData.width;
                    finalHeight = imageData.height;
                }

                canvas.width = finalWidth;
                canvas.height = finalHeight;

                // Apply Filters
                const brightness = this.filterBrightness ? this.filterBrightness.value : 100;
                const contrast = this.filterContrast ? this.filterContrast.value : 100;
                const grayscale = this.filterGrayscale && this.filterGrayscale.checked ? 100 : 0;
                const sepia = this.filterSepia && this.filterSepia.checked ? 100 : 0;

                ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;

                // Set background
                const isAutoBg = this.autoBackground && this.autoBackground.checked && imageData.hasTransparency;
                const bgFillMode = this.backgroundFillMode ? this.backgroundFillMode.value : 'color';

                if ((format === 'jpg' || format === 'jpeg' && !preserveTrans) || (bgColor && bgColor !== 'transparent') || isAutoBg) {
                    this.applySelectedBackground(ctx, canvas.width, canvas.height, imageData, bgColor, isAutoBg, bgFillMode);
                }

                progressCallback(30);

                // Handle circular crop
                if (resizeMode === 'circular' && cropShape === 'circle') {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(finalWidth / 2, finalHeight / 2, finalWidth / 2, 0, Math.PI * 2);
                    ctx.clip();
                }

                // Handle fill mode (crop)
                if (resizeMode === 'fill' && (width || height)) {
                    const sourceWidth = imageData.width;
                    const sourceHeight = imageData.height;
                    const sourceAspect = sourceWidth / sourceHeight;
                    const targetAspect = finalWidth / finalHeight;

                    let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;

                    if (sourceAspect > targetAspect) {
                        sw = sourceHeight * targetAspect;
                        sx = (sourceWidth - sw) / 2;
                    } else {
                        sh = sourceWidth / targetAspect;
                        sy = (sourceHeight - sh) / 2;
                    }

                    ctx.drawImage(imageData.image, sx, sy, sw, sh, 0, 0, finalWidth, finalHeight);
                } else if (resizeMode === 'stretch' && width && height) {
                    ctx.drawImage(imageData.image, 0, 0, finalWidth, finalHeight);
                } else {
                    // Fit mode or custom
                    const scale = Math.min(finalWidth / imageData.width, finalHeight / imageData.height);
                    const scaledWidth = imageData.width * scale;
                    const scaledHeight = imageData.height * scale;
                    const x = (finalWidth - scaledWidth) / 2;
                    const y = (finalHeight - scaledHeight) / 2;
                    ctx.drawImage(imageData.image, x, y, scaledWidth, scaledHeight);
                }

                if (resizeMode === 'circular' && cropShape === 'circle') {
                    ctx.restore();
                }
            }

            // Apply sharpening filter if enabled
            // Apply Sharpening if enabled
            const sharpeningAmount = this.filterSharpening ? parseInt(this.filterSharpening.value) : 0;

            if (sharpeningAmount > 0) {
                const imageData_ctx = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData_ctx.data;
                const width = canvas.width;
                const height = canvas.height;
                const mix = sharpeningAmount / 100; // 0 to 1

                // Create a temporary buffer to store original data for kernel access
                const buffer = new Uint8ClampedArray(data);

                // Simple 3x3 sharpening kernel
                //  0 -1  0
                // -1  5 -1
                //  0 -1  0

                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const i = (y * width + x) * 4;

                        // Apply kernel for RGB channels
                        for (let c = 0; c < 3; c++) {
                            const val = buffer[i + c] * 5
                                - buffer[((y - 1) * width + x) * 4 + c] // top
                                - buffer[((y + 1) * width + x) * 4 + c] // bottom
                                - buffer[(y * width + (x - 1)) * 4 + c] // left
                                - buffer[(y * width + (x + 1)) * 4 + c]; // right

                            // Mix original with sharpened based on slider amount
                            data[i + c] = buffer[i + c] * (1 - mix) + val * mix;
                        }
                    }
                }
                ctx.putImageData(imageData_ctx, 0, 0);
            }

            progressCallback(70);

            // Handle PDF export: embed the rendered canvas into a PDF page
            if (format === 'pdf') {
                try {
                    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
                        reject(new Error('jsPDF library not loaded. Please refresh the page.'));
                        return;
                    }
                    const { jsPDF: _jsPDF } = window.jspdf || {};
                    const JsPDF = _jsPDF || jsPDF;

                    // PDF dimensions in mm (portrait A4 by default, scaled to image aspect ratio)
                    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);

                    // Calculate page size to match image aspect ratio (A4 width max)
                    const a4Width = 210; // mm
                    const a4Height = 297; // mm
                    let pdfW = a4Width;
                    let pdfH = (finalHeight / finalWidth) * pdfW;
                    if (pdfH > a4Height) {
                        pdfH = a4Height;
                        pdfW = (finalWidth / finalHeight) * pdfH;
                    }
                    const orientation = pdfW >= pdfH ? 'landscape' : 'portrait';

                    const doc = new JsPDF({ orientation, unit: 'mm', format: [pdfW, pdfH] });
                    doc.addImage(imgDataUrl, 'JPEG', 0, 0, pdfW, pdfH);

                    const pdfBlob = doc.output('blob');
                    progressCallback(100);

                    const convertedName = this.generateFileName(imageData.name, 'pdf', sizeName);

                    resolve({
                        original: imageData,
                        blob: pdfBlob,
                        name: convertedName,
                        size: pdfBlob.size,
                        format: 'pdf',
                        width: finalWidth,
                        height: finalHeight,
                        url: URL.createObjectURL(pdfBlob)
                    });
                } catch (err) {
                    reject(new Error('PDF export failed: ' + err.message));
                }
                return;
            }

            // Handle SVG format separately
            if (format === 'svg') {
                // Convert canvas to base64 PNG for embedding in SVG
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64Image = reader.result;
                        // Create SVG with embedded image
                        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${finalWidth}" height="${finalHeight}" viewBox="0 0 ${finalWidth} ${finalHeight}">
    <image width="${finalWidth}" height="${finalHeight}" xlink:href="${base64Image}"/>
</svg>`;

                        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
                        progressCallback(100);

                        const convertedName = this.generateFileName(imageData.name, format, sizeName);

                        resolve({
                            original: imageData,
                            blob: svgBlob,
                            name: convertedName,
                            size: svgBlob.size,
                            format: format,
                            width: finalWidth,
                            height: finalHeight,
                            url: URL.createObjectURL(svgBlob)
                        });
                    };
                    reader.onerror = () => reject(new Error('Failed to read image data'));
                    reader.readAsDataURL(blob);
                }, 'image/png', 1.0); // Use PNG at max quality for embedding
                return;
            }

            // Handle formats that Canvas API doesn't support natively
            // Canvas API natively supports: PNG, JPEG, WebP (browser dependent)
            // For other formats, we'll convert to a supported format
            const normalizedFormat = this.normalizeFormat(format);

            // Determine which format Canvas can actually generate
            let canvasFormat = normalizedFormat;
            let canvasMimeType = this.getMimeType(canvasFormat);

            // Check if format is natively supported by canvas.toBlob
            // Most browsers: PNG, JPEG, WebP
            // Limited support: AVIF (Chrome/Edge only)
            // Not supported: BMP, GIF, TIFF - convert to PNG
            if (!['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(normalizedFormat)) {
                // Fallback to PNG for unsupported formats (BMP, GIF, TIFF)
                canvasFormat = 'png';
                canvasMimeType = 'image/png';
            }

            // Try to convert - some browsers may not support all formats
            canvas.toBlob((blob) => {
                if (!blob) {
                    // If conversion failed, try PNG as fallback
                    canvas.toBlob((fallbackBlob) => {
                        if (!fallbackBlob) {
                            reject(new Error('Failed to convert image'));
                            return;
                        }

                        progressCallback(100);
                        const convertedName = this.generateFileName(imageData.name, normalizedFormat, sizeName);

                        resolve({
                            original: imageData,
                            blob: fallbackBlob,
                            name: convertedName,
                            size: fallbackBlob.size,
                            format: normalizedFormat, // Keep requested format name
                            width: finalWidth,
                            height: finalHeight,
                            url: URL.createObjectURL(fallbackBlob)
                        });
                    }, 'image/png', quality);
                    return;
                }

                progressCallback(100);
                const convertedName = this.generateFileName(imageData.name, normalizedFormat, sizeName);

                resolve({
                    original: imageData,
                    blob: blob,
                    name: convertedName,
                    size: blob.size,
                    format: normalizedFormat,
                    width: finalWidth,
                    height: finalHeight,
                    url: URL.createObjectURL(blob)
                });
            }, canvasMimeType, quality);
        });
    }

    applySelectedBackground(ctx, width, height, imageData, bgColor, isAutoBg, bgFillMode) {
        if (bgFillMode === 'none') return;

        if (bgFillMode === 'blurred') {
            ctx.save();
            ctx.filter = 'blur(20px) brightness(0.8)';
            ctx.drawImage(imageData.image, 0, 0, width, height);
            ctx.restore();
        } else if (bgFillMode === 'image' && this.customBgImage) {
            ctx.drawImage(this.customBgImage, 0, 0, width, height);
        } else {
            ctx.fillStyle = (bgColor && bgColor !== 'transparent') ? bgColor : '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }
    }

    generateFileName(originalName, format, sizeName = '', index = 0) {
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const normalizedFormat = this.normalizeFormat(format);
        // Keep the requested format extension even if we convert internally
        const formatExt = normalizedFormat;

        const namingPattern = this.customNaming.value === 'custom'
            ? this.customNamingPattern.value || '{name}_{width}x{height}.{format}'
            : this.customNaming.value;

        // Extract dimensions from sizeName if available
        let width = '';
        let height = '';
        if (sizeName && sizeName.includes('x')) {
            const parts = sizeName.split('x');
            width = parts[0].replace(/\D/g, '');
            height = parts[1]?.replace(/\D/g, '') || '';
        }

        let fileName = namingPattern
            .replace(/{name}/g, nameWithoutExt)
            .replace(/{width}/g, width)
            .replace(/{height}/g, height)
            .replace(/{format}/g, formatExt)
            .replace(/{index}/g, index)
            .replace(/{size}/g, sizeName || '');

        // Fallback to default if pattern didn't work
        if (fileName === namingPattern || !fileName) {
            const sizeSuffix = sizeName && sizeName !== 'custom' && sizeName !== 'original' ? `_${sizeName}` : '';
            fileName = `${nameWithoutExt}${sizeSuffix}.${formatExt}`;
        }

        return fileName;
    }

    applyWatermark(ctx, width, height) {
        const text = this.watermarkText.value || '© Copyright';
        const position = this.watermarkPosition.value;
        const opacity = this.watermarkOpacity.value / 100;
        const color = this.watermarkColor.value;

        // Scale font size based on image width (4% of width)
        const fontSize = Math.max(14, Math.floor(width * 0.04));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Measure text for positioning
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize; // Approximate
        const padding = Math.max(20, width * 0.02); // 2% padding

        let x, y;

        switch (position) {
            case 'center':
                x = width / 2;
                y = height / 2;
                break;
            case 'top-left':
                x = padding + textWidth / 2;
                y = padding + textHeight / 2;
                break;
            case 'top-right':
                x = width - padding - textWidth / 2;
                y = padding + textHeight / 2;
                break;
            case 'bottom-left':
                x = padding + textWidth / 2;
                y = height - padding - textHeight / 2;
                break;
            case 'bottom-right':
            default:
                x = width - padding - textWidth / 2;
                y = height - padding - textHeight / 2;
                break;
        }

        ctx.save();
        ctx.globalAlpha = opacity;

        // Optional: Text Shadow/Stroke for better visibility
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    showResults() {
        if (this.progressSection) this.progressSection.style.display = 'none';
        if (this.resultsSection) this.resultsSection.style.display = 'block';
        if (this.resultsContainer) this.resultsContainer.innerHTML = '';

        const groupedResults = {};
        this.convertedImages.forEach((converted) => {
            const originalName = converted.original.name;
            if (!groupedResults[originalName]) {
                groupedResults[originalName] = [];
            }
            groupedResults[originalName].push(converted);
        });

        Object.keys(groupedResults).forEach((originalName) => {
            const results = groupedResults[originalName];
            results.forEach((converted) => {
                const resultCard = document.createElement('div');
                resultCard.className = 'glass-card result-card fade-in';

                const originalSize = converted.original.originalSize;
                const newSize = converted.size;
                const sizeSaved = originalSize - newSize;
                const percentSaved = ((sizeSaved / originalSize) * 100).toFixed(1);

                resultCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3 style="font-size: 1.25rem;">${converted.name}</h3>
                        <a href="${converted.url}" download="${converted.name}" class="btn btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download
                        </a>
                    </div>
                    <div class="comparison-layout">
                        <div class="comparison-pane">
                            <p style="margin-bottom: 0.75rem; color: var(--text-secondary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Original Source</p>
                            <img src="${converted.original.image.src}" class="comparison-img" alt="Original">
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                <strong>${this.formatFileSize(originalSize)}</strong> • ${converted.original.width}×${converted.original.height}
                            </div>
                        </div>
                        <div class="comparison-pane">
                            <p style="margin-bottom: 0.75rem; color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Optimized Result</p>
                            <img src="${converted.url}" class="comparison-img" alt="Converted" style="border-color: var(--primary)">
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                <strong style="color: var(--text-primary)">${this.formatFileSize(newSize)}</strong> • ${converted.width}×${converted.height}
                                ${sizeSaved > 0 ? `<span style="color: var(--success); margin-left: 0.5rem;">(Saved ${percentSaved}%)</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;

                this.resultsContainer.appendChild(resultCard);
            });
        });

        if (this.convertedImages.length > 1) {
            this.downloadAllBtn.style.display = 'inline-flex';
        } else {
            this.downloadAllBtn.style.display = 'none';
        }
    }

    async downloadAll() {
        if (this.convertedImages.length === 0) return;

        const zipFormat = this.zipFormat.value;

        if (zipFormat === 'individual') {
            // Download individually
            this.convertedImages.forEach(converted => {
                const link = document.createElement('a');
                link.href = converted.url;
                link.download = converted.name;
                link.click();
            });
            this.showNotification('Files downloaded individually!', 'success');
            return;
        }

        // --- Consolidated Multi-page PDF ---
        const selectedFormat = this.outputFormat ? this.outputFormat.value : '';
        const allArePdfs = this.convertedImages.every(c => c.format === 'pdf');

        if (selectedFormat === 'pdf' && allArePdfs) {
            try {
                const { jsPDF: _jsPDF } = window.jspdf || {};
                const JsPDF = _jsPDF || (typeof jsPDF !== 'undefined' ? jsPDF : null);
                if (!JsPDF) {
                    this.showNotification('jsPDF library not loaded. Please refresh.', 'error');
                    return;
                }

                this.showNotification('Building consolidated PDF...', 'info');

                let doc = null;
                for (const converted of this.convertedImages) {
                    const origImg = converted.original.image;
                    const w = converted.width;
                    const h = converted.height;

                    const a4Width = 210;
                    const a4Height = 297;
                    let pdfW = a4Width;
                    let pdfH = (h / w) * pdfW;
                    if (pdfH > a4Height) { pdfH = a4Height; pdfW = (w / h) * pdfH; }
                    const orientation = pdfW >= pdfH ? 'landscape' : 'portrait';

                    const cv = document.createElement('canvas');
                    cv.width = w; cv.height = h;
                    cv.getContext('2d').drawImage(origImg, 0, 0, w, h);
                    const imgDataUrl = cv.toDataURL('image/jpeg', this.quality ? this.quality.value / 100 : 0.85);

                    if (!doc) {
                        doc = new JsPDF({ orientation, unit: 'mm', format: [pdfW, pdfH] });
                    } else {
                        doc.addPage([pdfW, pdfH], orientation);
                    }
                    doc.addImage(imgDataUrl, 'JPEG', 0, 0, pdfW, pdfH);
                }

                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `converted_images_${Date.now()}.pdf`;
                link.click();
                this.showNotification(`Consolidated PDF with ${this.convertedImages.length} page(s) downloaded! PDF`, 'success');
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
            } catch (err) {
                this.showNotification('PDF merge failed: ' + err.message, 'error');
            }
            return;
        }

        // Create ZIP
        if (typeof JSZip === 'undefined') {
            this.showNotification('ZIP library not loaded. Please refresh.', 'error');
            return;
        }

        const zip = new JSZip();
        const organizeByFormat = this.organizeByFormat?.checked;
        const organizeBySize = this.organizeBySize?.checked;

        for (const converted of this.convertedImages) {
            const blob = await fetch(converted.url).then(r => r.blob());
            let filePath = converted.name;

            if (organizeByFormat) {
                filePath = `${converted.format.toUpperCase()}/${filePath}`;
            }
            if (organizeBySize) {
                const sizeFolder = `${converted.width}x${converted.height}`;
                filePath = organizeByFormat
                    ? `${converted.format.toUpperCase()}/${sizeFolder}/${converted.name}`
                    : `${sizeFolder}/${filePath}`;
            }

            zip.file(filePath, blob);
        }

        if (organizeByFormat || organizeBySize) {
            const readme = `Image Converter Pro - Generated Files\n` +
                `Generated: ${new Date().toLocaleString()}\n` +
                `Total files: ${this.convertedImages.length}\n`;
            zip.file('readme.txt', readme);
        }

        const compressionLevel = this.zipCompressionLevel?.value === 'fast' ? 1 :
            this.zipCompressionLevel?.value === 'maximum' ? 9 : 6;
        const zipFileName = this.zipFileName?.value.trim() || `converted_images_${Date.now()}`;

        zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: compressionLevel }
        }).then((zipBlob) => {
            const zipUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `${zipFileName}.zip`;
            link.click();
            this.showNotification('Images downloaded successfully!', 'success');
            setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
        });
    }

    clearAll() {
        if (this.images.length === 0 && this.convertedImages.length === 0 && this.customSizesList.length === 0) {
            this.showNotification('Workspace is already empty', 'info');
            return;
        }
        if (confirm('Clear all images and settings?')) {
            this.images = [];
            this.convertedImages = [];
            this.customSizesList = [];
            this.settingsPanel.style.display = 'none';
            this.imagesGrid.style.display = 'none';
            this.progressSection.style.display = 'none';
            this.resultsSection.style.display = 'none';
            this.customSizeListSection.style.display = 'none';
            this.fileInput.value = '';
            this.updateCustomSizesListUI();
            this.showNotification('Workspace cleared', 'info');
        }
    }

    addToHistory() {
        if (this.convertedImages.length === 0) return;

        const historyEntry = {
            timestamp: Date.now(),
            count: this.convertedImages.length,
            formats: [...new Set(this.convertedImages.map(img => img.format))],
            preview: this.convertedImages[0].url
        };

        this.conversionHistory.push(historyEntry);
        this.saveHistory();
    }

    toggleHistory() {
        if (this.historySection.style.display === 'none') {
            this.displayHistory();
            this.historySection.style.display = 'block';
        } else {
            this.historySection.style.display = 'none';
        }
    }

    displayHistory() {
        this.historyList.innerHTML = '';

        if (this.conversionHistory.length === 0) {
            this.historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No conversion history yet</p>';
            return;
        }

        this.conversionHistory.slice().reverse().forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const date = new Date(entry.timestamp);
            item.innerHTML = `
                <img src="${entry.preview}" alt="Preview">
                <div style="font-weight: 600; margin-top: 5px;">${entry.count} file(s)</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${date.toLocaleString()}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${entry.formats.join(', ').toUpperCase()}</div>
            `;
            this.historyList.appendChild(item);
        });
    }

    clearHistory() {
        if (confirm('Clear all conversion history?')) {
            this.conversionHistory = [];
            this.saveHistory();
            this.displayHistory();
            this.showNotification('Conversion history cleared', 'info');
        }
    }

    showPresetModal() {
        this.presetModal.style.display = 'flex';
        this.presetName.value = '';
        this.presetName.focus();
    }

    closePresetModal() {
        this.presetModal.style.display = 'none';
    }

    saveCurrentPreset() {
        const name = this.presetName.value.trim();
        if (!name) {
            this.showNotification('Please enter a preset name', 'error');
            return;
        }

        const preset = {
            name: name,
            outputFormat: this.outputFormat.value,
            quality: this.quality.value,
            resizeMode: this.resizeMode.value,
            resizeType: this.resizeType.value,
            resizeWidth: this.resizeWidth.value,
            resizeHeight: this.resizeHeight.value,
            backgroundColor: this.backgroundColor.value,
            preserveTransparency: this.preserveTransparency.checked,
            autoPadding: this.autoPadding.checked,
            autoSharpening: this.autoSharpening.checked,
            customNaming: this.customNaming.value,
            customNamingPattern: this.customNamingPattern.value,
            timestamp: Date.now()
        };

        this.userPresets[name] = preset;
        this.saveUserPresets();
        this.updateUserPresetsUI();
        this.closePresetModal();
    }

    updateUserPresetsUI() {
        if (!this.userPresetsList || !this.userPresetsSection) return;

        this.userPresetsList.innerHTML = '';

        if (Object.keys(this.userPresets).length === 0) {
            this.userPresetsSection.style.display = 'none';
            return;
        }

        this.userPresetsSection.style.display = 'block';

        Object.keys(this.userPresets).forEach(presetName => {
            const btn = document.createElement('button');
            btn.className = 'user-preset-btn';
            btn.textContent = presetName;
            btn.innerHTML = `${presetName} <span class="delete-preset" data-preset="${presetName}">×</span>`;

            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-preset')) {
                    e.stopPropagation();
                    this.deletePreset(presetName);
                    return;
                }
                this.applyPreset(presetName);
            });

            this.userPresetsList.appendChild(btn);
        });
    }

    applyPreset(presetName) {
        const preset = this.userPresets[presetName];
        if (!preset) return;

        // Handle custom size list presets
        if (preset.type === 'custom-size-list' && preset.sizes) {
            this.customSizesList = JSON.parse(JSON.stringify(preset.sizes));
            this.updateCustomSizesListUI();
            this.selectPreset('custom-list');
            return;
        }

        // Handle regular presets
        this.outputFormat.value = preset.outputFormat || 'png';
        this.quality.value = preset.quality || 80;
        this.qualityValue.textContent = preset.quality || 80;
        this.resizeMode.value = preset.resizeMode || 'fit';
        this.resizeType.value = preset.resizeType || 'pixels';
        this.resizeWidth.value = preset.resizeWidth || '';
        this.resizeHeight.value = preset.resizeHeight || '';
        this.backgroundColor.value = preset.backgroundColor || '#ffffff';
        this.preserveTransparency.checked = preset.preserveTransparency !== false;
        this.autoPadding.checked = preset.autoPadding || false;
        this.autoSharpening.checked = preset.autoSharpening || false;
        this.customNaming.value = preset.customNaming || 'original_size';
        this.customNamingPattern.value = preset.customNamingPattern || '';

        this.selectPreset('none');
        this.resizeType.dispatchEvent(new Event('change'));
        this.customNaming.dispatchEvent(new Event('change'));
    }

    deletePreset(presetName) {
        if (confirm(`Delete preset "${presetName}"?`)) {
            delete this.userPresets[presetName];
            this.saveUserPresets();
            this.updateUserPresetsUI();
        }
    }

    normalizeFormat(format) {
        // Normalize format names
        const formatLower = format.toLowerCase();
        if (formatLower === 'jpeg') return 'jpg';
        if (formatLower === 'pdf') return 'pdf';
        return formatLower;
    }

    getMimeType(format) {
        const normalized = this.normalizeFormat(format);
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'bmp': 'image/bmp',
            'gif': 'image/gif',
            'ico': 'image/png', // ICO is converted to PNG
            'avif': 'image/avif',
            'tiff': 'image/tiff',
            'pdf': 'application/pdf'
        };
        return mimeTypes[normalized] || 'image/png';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span>${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        // Remove after duration
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, duration);
    }
}

// Initialize the application
let imageConverter;
document.addEventListener('DOMContentLoaded', () => {
    imageConverter = new ImageConverter();
    window.imageConverter = imageConverter; // Make globally accessible for inline onclick handlers
});

// Service Worker message handling
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Service Worker message:', event.data);
    });
}


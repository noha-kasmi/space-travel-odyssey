class BookingManager {
    constructor() {
        this.bookingData = null;
        this.currentDestination = null;
        this.currentPackage = null;
        this.passengerCount = 1;
        this.selectedExtras = new Set();
        this.passengerForms = [];
        
        this.init();
    }

    async init() {
        await this.loadBookingData();
        this.setupEventListeners();
        this.populateDestinations();
        this.populateExtras();
        this.setupDateValidation();
        this.addPassengerForm(1);
        this.updatePrice();
    }

    async loadBookingData() {
        try {
            const response = await fetch('booking-options.json');
            this.bookingData = await response.json();
        } catch (error) {
            console.error('Error loading booking data:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('destination').addEventListener('change', (e) => {
            this.populatePackages(e.target.value);
            this.toggleSuitSizeField();
            this.updatePrice();
            this.validateField(e.target);
        });

        document.getElementById('package').addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            this.currentPackage = selectedOption ? 
                this.bookingData.destinations
                    .find(d => d.id === document.getElementById('destination').value)
                    ?.packages.find(p => p.id === selectedOption.value)
                : null;
            this.toggleSuitSizeField();
            this.updatePrice();
            this.validateField(e.target);
        });

        document.querySelectorAll('.passenger-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.passenger-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
                this.passengerCount = parseInt(e.currentTarget.dataset.passengers);
                document.getElementById('passengers').value = this.passengerCount;
                this.updatePassengerForms();
                this.updatePrice();
            });
        });

        document.querySelectorAll('.accommodation-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.accommodation-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
                document.getElementById('accommodation').value = e.currentTarget.dataset.type;
                this.updatePrice();
            });
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('extra-checkbox')) {
                if (e.target.checked) {
                    this.selectedExtras.add(e.target.value);
                } else {
                    this.selectedExtras.delete(e.target.value);
                }
                this.updatePrice();
            }
        });

        document.getElementById('addPassenger').addEventListener('click', () => {
            this.addPassengerForm(this.passengerForms.length + 1);
        });

        document.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('blur', (e) => this.validateField(e.target));
            if (field.type === 'email' || field.type === 'tel') {
                field.addEventListener('input', (e) => this.validateField(e.target));
            }
        });

        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking();
        });
    }

    populateDestinations() {
        const select = document.getElementById('destination');
        this.bookingData.destinations.forEach(dest => {
            const option = document.createElement('option');
            option.value = dest.id;
            option.textContent = `${dest.name} - $${dest.basePrice.toLocaleString()}`;
            select.appendChild(option);
        });
    }

    populatePackages(destinationId) {
        const select = document.getElementById('package');
        select.innerHTML = '<option value="">Select Package</option>';
        
        const destination = this.bookingData.destinations.find(d => d.id === destinationId);
        if (!destination) return;

        destination.packages.forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg.id;
            option.textContent = `${pkg.name} ${pkg.price > 0 ? `(+$${pkg.price.toLocaleString()})` : ''}`;
            select.appendChild(option);
        });

        this.currentDestination = destination;
    }

    populateExtras() {
        const container = document.createElement('div');
        container.className = 'space-y-4';
        container.innerHTML = '<h3 class="font-orbitron text-xl mb-4">Optional Extras</h3>';
        
        this.bookingData.extras.forEach(extra => {
            const extraDiv = document.createElement('div');
            extraDiv.className = 'flex items-start space-x-3 p-4 border border-neon-blue/20 rounded-lg';
            extraDiv.innerHTML = `
                <input type="checkbox" id="extra-${extra.id}" value="${extra.id}" 
                       class="extra-checkbox mt-1 form-input">
                <label for="extra-${extra.id}" class="flex-1 cursor-pointer">
                    <div class="font-orbitron">${extra.name} - $${extra.price.toLocaleString()}</div>
                    <div class="text-sm text-gray-400 mt-1">${extra.description}</div>
                </label>
            `;
            container.appendChild(extraDiv);
        });


        const accommodationSection = document.querySelector('[data-type="zero-g"]').closest('.accommodation-option').parentElement;
        accommodationSection.parentElement.insertBefore(container, accommodationSection.nextElementSibling);
    }

    toggleSuitSizeField() {
        let suitSizeGroup = document.getElementById('suitSizeGroup');
        if (!suitSizeGroup) {
            suitSizeGroup = document.createElement('div');
            suitSizeGroup.id = 'suitSizeGroup';
            suitSizeGroup.className = 'mt-6';
            suitSizeGroup.innerHTML = `
                <label class="block text-gray-300 mb-3 text-lg">Space Suit Size</label>
                <select class="form-select w-full px-4 py-4 text-lg" id="suitSize">
                    <option value="">Select your suit size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xlarge">X-Large</option>
                </select>
            `;
            document.getElementById('package').closest('div').appendChild(suitSizeGroup);
        }

        const requiresSuit = this.currentPackage?.requiresSuitSize;
        suitSizeGroup.style.display = requiresSuit ? 'block' : 'none';
        
        if (requiresSuit) {
            document.getElementById('suitSize').setAttribute('required', 'required');
        } else {
            document.getElementById('suitSize').removeAttribute('required');
        }
    }

    addPassengerForm(number) {
        const form = document.createElement('div');
        form.className = 'passenger-form booking-section p-6 mt-6';
        form.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-orbitron text-xl text-glow">Passenger ${number}</h3>
                <button type="button" class="text-red-400 hover:text-red-300 remove-passenger">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-300 mb-2">First Name *</label>
                    <input type="text" class="form-input w-full px-4 py-3 passenger-firstname" required>
                    <div class="error-message text-red-400 text-sm mt-1 hidden"></div>
                </div>
                <div>
                    <label class="block text-gray-300 mb-2">Last Name *</label>
                    <input type="text" class="form-input w-full px-4 py-3 passenger-lastname" required>
                    <div class="error-message text-red-400 text-sm mt-1 hidden"></div>
                </div>
                <div>
                    <label class="block text-gray-300 mb-2">Email *</label>
                    <input type="email" class="form-input w-full px-4 py-3 passenger-email" required>
                    <div class="error-message text-red-400 text-sm mt-1 hidden"></div>
                </div>
                <div>
                    <label class="block text-gray-300 mb-2">Phone *</label>
                    <input type="tel" class="form-input w-full px-4 py-3 passenger-phone" required>
                    <div class="error-message text-red-400 text-sm mt-1 hidden"></div>
                </div>
            </div>
        `;

        document.getElementById('addPassenger').parentElement.before(form);
        this.passengerForms.push(form);

        form.querySelector('.remove-passenger').addEventListener('click', () => {
            if (this.passengerForms.length > 1) {
                form.remove();
                this.passengerForms = this.passengerForms.filter(f => f !== form);
                this.renumberPassengerForms();
                this.updatePrice();
            }
        });

        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            if (input.type === 'email' || input.type === 'tel') {
                input.addEventListener('input', (e) => this.validateField(e.target));
            }
        });
    }

    renumberPassengerForms() {
        this.passengerForms.forEach((form, index) => {
            form.querySelector('h3').textContent = `Passenger ${index + 1}`;
        });
    }

    updatePassengerForms() {
        const currentCount = this.passengerForms.length;
        
        if (this.passengerCount > currentCount) {
            for (let i = currentCount + 1; i <= this.passengerCount; i++) {
                this.addPassengerForm(i);
            }
        } else if (this.passengerCount < currentCount) {
            while (this.passengerForms.length > this.passengerCount) {
                const form = this.passengerForms.pop();
                form.remove();
            }
            this.renumberPassengerForms();
        }
    }

    setupDateValidation() {
        const departureDate = document.getElementById('departureDate');
        const today = new Date().toISOString().split('T')[0];
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        const maxDateStr = maxDate.toISOString().split('T')[0];
        
        departureDate.setAttribute('min', today);
        departureDate.setAttribute('max', maxDateStr);
    }

    validateField(field) {
        const errorDiv = field.nextElementSibling?.classList?.contains('error-message') 
            ? field.nextElementSibling 
            : field.parentElement.querySelector('.error-message');
        
        if (!errorDiv) return true;

        let isValid = true;
        let message = '';

        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }
        else if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        else if (field.type === 'tel' && field.value.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = field.value.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }
        else if (field.type === 'date' && field.value) {
            const selectedDate = new Date(field.value);
            const today = new Date();
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 30);
            
            if (selectedDate < today) {
                isValid = false;
                message = 'Departure date must be in the future';
            } else if (selectedDate > maxDate) {
                isValid = false;
                message = 'Departure date must be within 30 days';
            }
        }

        if (!isValid) {
            field.classList.add('border-red-400');
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        } else {
            field.classList.remove('border-red-400');
            errorDiv.classList.add('hidden');
        }

        return isValid;
    }

    validateAllFields() {
        let isValid = true;
        const fields = document.querySelectorAll('#bookingForm input[required], #bookingForm select[required]');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    calculatePrice() {
        const destination = this.bookingData.destinations.find(
            d => d.id === document.getElementById('destination').value
        );
        const packageSelect = document.getElementById('package');
        const selectedPackage = packageSelect.value ? 
            destination?.packages.find(p => p.id === packageSelect.value) : null;

        let total = 0;
        const breakdown = [];

        if (destination) {
            total += destination.basePrice;
            breakdown.push({
                item: destination.name,
                amount: destination.basePrice
            });
        }

        if (selectedPackage) {
            total += selectedPackage.price;
            if (selectedPackage.price > 0) {
                breakdown.push({
                    item: selectedPackage.name,
                    amount: selectedPackage.price
                });
            }
        }

        const accommodation = document.getElementById('accommodation').value;
        let accommodationMultiplier = 1;
        switch (accommodation) {
            case 'luxury':
                accommodationMultiplier = 1.5;
                breakdown.push({
                    item: 'Luxury Suite Upgrade',
                    amount: destination ? destination.basePrice * 0.5 : 0
                });
                break;
            case 'zero-g':
                accommodationMultiplier = 2;
                breakdown.push({
                    item: 'Zero-G Pod Upgrade',
                    amount: destination ? destination.basePrice : 0
                });
                break;
        }
        total *= accommodationMultiplier;

        total *= this.passengerCount;
        if (this.passengerCount > 1) {
            breakdown.push({
                item: `${this.passengerCount} passengers`,
                amount: 0
            });
        }

        this.selectedExtras.forEach(extraId => {
            const extra = this.bookingData.extras.find(e => e.id === extraId);
            if (extra) {
                total += extra.price * this.passengerCount;
                breakdown.push({
                    item: `${extra.name} (x${this.passengerCount})`,
                    amount: extra.price * this.passengerCount
                });
            }
        });

        return { total, breakdown };
    }

    updatePrice() {
        const { total, breakdown } = this.calculatePrice();
        
        let priceDisplay = document.getElementById('priceDisplay');
        if (!priceDisplay) {
            priceDisplay = document.createElement('div');
            priceDisplay.id = 'priceDisplay';
            priceDisplay.className = 'booking-section p-6 mt-8';
            document.getElementById('bookingForm').insertBefore(priceDisplay, document.querySelector('button[type="submit"]').parentElement);
        }

        priceDisplay.innerHTML = `
            <h2 class="font-orbitron text-2xl mb-4 text-glow">Price Summary</h2>
            <div class="space-y-2 mb-4">
                ${breakdown.map(item => `
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">${item.item}</span>
                        <span class="font-orbitron">${item.amount > 0 ? `$${item.amount.toLocaleString()}` : 'Included'}</span>
                    </div>
                `).join('')}
            </div>
            <div class="border-t border-neon-blue/30 pt-4">
                <div class="flex justify-between items-center text-xl">
                    <span class="font-orbitron">Total</span>
                    <span class="font-orbitron text-neon-blue text-2xl">$${total.toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    async handleBooking() {
        if (!this.validateAllFields()) {
            alert('Please fix the validation errors before submitting.');
            return;
        }

        const { total, breakdown } = this.calculatePrice();
        const booking = {
            id: 'BK' + Date.now(),
            destination: document.getElementById('destination').value,
            package: document.getElementById('package').value,
            departureDate: document.getElementById('departureDate').value,
            passengers: this.passengerCount,
            accommodation: document.getElementById('accommodation').value,
            extras: Array.from(this.selectedExtras),
            total: total,
            breakdown: breakdown,
            date: new Date().toISOString(),
            status: 'confirmed'
        };

        const user = JSON.parse(localStorage.getItem('spaceVoyagerUser'));
        if (user) {
            user.bookings = user.bookings || [];
            user.bookings.push(booking);
            localStorage.setItem('spaceVoyagerUser', JSON.stringify(user));
        } else {
            const continueAsGuest = confirm('Would you like to continue as guest? Your booking will be saved but you won t be able to access it later without an account.');
            if (continueAsGuest) {
                const guestBookings = JSON.parse(localStorage.getItem('guestBookings') || '[]');
                guestBookings.push(booking);
                localStorage.setItem('guestBookings', JSON.stringify(guestBookings));
            } else {
                window.location.href = 'login.html?redirect=booking';
                return;
            }
        }

        window.location.href = `booking-confirmation.html?id=${booking.id}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BookingManager();
});
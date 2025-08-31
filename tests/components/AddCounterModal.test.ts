import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AddCounterModal from '../../components/AddCounterModal.vue';

describe('AddCounterModal Component', () => {
  it('should render modal with proper structure', () => {
    const wrapper = mount(AddCounterModal, {
      global: {
        stubs: {
          Teleport: false,
        },
      },
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.find('[aria-modal="true"]').exists()).toBe(true);
    expect(wrapper.find('#add-title').text()).toBe('Nuevo contador');
    expect(wrapper.find('label[for="add-name"]').text()).toBe('Nombre (1..20)');
  });

  it('should have input with proper attributes', () => {
    const wrapper = mount(AddCounterModal);

    const input = wrapper.find('#add-name');
    expect(input.exists()).toBe(true);
    expect(input.attributes('maxlength')).toBe('20');
    expect(input.attributes('placeholder')).toBe('Ej: Ventas Q3');
    expect(input.attributes('autofocus')).toBeDefined();
  });

  it('should disable confirm button initially', () => {
    const wrapper = mount(AddCounterModal);

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    expect(confirmButton.attributes('disabled')).toBeDefined();
  });

  it('should enable confirm button with valid name', async () => {
    const wrapper = mount(AddCounterModal);

    const input = wrapper.find('#add-name');
    await input.setValue('Valid Name');

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    expect(confirmButton.attributes('disabled')).toBeUndefined();
  });

  it('should disable confirm button with empty name', async () => {
    const wrapper = mount(AddCounterModal);

    const input = wrapper.find('#add-name');
    await input.setValue('Valid Name');
    await input.setValue('');

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    expect(confirmButton.attributes('disabled')).toBeDefined();
  });

  it('should disable confirm button with whitespace-only name', async () => {
    const wrapper = mount(AddCounterModal);

    const input = wrapper.find('#add-name');
    await input.setValue('   ');

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    expect(confirmButton.attributes('disabled')).toBeDefined();
  });

  it('should disable confirm button with name longer than 20 characters', async () => {
    const wrapper = mount(AddCounterModal);

    const input = wrapper.find('#add-name');
    await input.setValue('This name is way too long for the counter limit');

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    expect(confirmButton.attributes('disabled')).toBeDefined();
  });

  it('should emit confirm event with trimmed name when confirm button is clicked', async () => {
    const wrapper = mount(AddCounterModal);

    const input = wrapper.find('#add-name');
    await input.setValue('  Test Counter  ');

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    await confirmButton.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Test Counter']);
  });

  it('should not emit confirm event when button is disabled', async () => {
    const wrapper = mount(AddCounterModal);

    const confirmButton = wrapper.find('button:contains("Confirmar")');
    await confirmButton.trigger('click');

    expect(wrapper.emitted('confirm')).toBeFalsy();
  });

  it('should emit cancel event when cancel button is clicked', async () => {
    const wrapper = mount(AddCounterModal);

    const cancelButton = wrapper.find('button:contains("Cancelar")');
    await cancelButton.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('should emit cancel event when clicking outside modal', async () => {
    const wrapper = mount(AddCounterModal);

    const overlay = wrapper.find('.modal-overlay');
    await overlay.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('should not emit cancel when clicking inside modal', async () => {
    const wrapper = mount(AddCounterModal);

    const modal = wrapper.find('.modal');
    await modal.trigger('click');

    expect(wrapper.emitted('cancel')).toBeFalsy();
  });

  describe('Validation logic', () => {
    it('should validate name length correctly', async () => {
      const wrapper = mount(AddCounterModal);
      const input = wrapper.find('#add-name');
      const confirmButton = wrapper.find('button:contains("Confirmar")');

      // Test minimum valid length (1 character)
      await input.setValue('A');
      expect(confirmButton.attributes('disabled')).toBeUndefined();

      // Test maximum valid length (20 characters)
      await input.setValue('12345678901234567890');
      expect(confirmButton.attributes('disabled')).toBeUndefined();

      // Test over maximum length (21 characters)
      await input.setValue('123456789012345678901');
      expect(confirmButton.attributes('disabled')).toBeDefined();
    });

    it('should handle whitespace trimming in validation', async () => {
      const wrapper = mount(AddCounterModal);
      const input = wrapper.find('#add-name');
      const confirmButton = wrapper.find('button:contains("Confirmar")');

      // Valid name with whitespace
      await input.setValue('  A  ');
      expect(confirmButton.attributes('disabled')).toBeUndefined();

      // Name that becomes empty after trimming
      await input.setValue('   ');
      expect(confirmButton.attributes('disabled')).toBeDefined();

      // Name that becomes too long after considering only trimmed content
      await input.setValue('  12345678901234567890  '); // 20 chars after trim
      expect(confirmButton.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(AddCounterModal);

      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('aria-modal')).toBe('true');
      expect(dialog.attributes('aria-labelledby')).toBe('add-title');
    });

    it('should have proper label association', () => {
      const wrapper = mount(AddCounterModal);

      const label = wrapper.find('label[for="add-name"]');
      const input = wrapper.find('#add-name');

      expect(label.exists()).toBe(true);
      expect(input.exists()).toBe(true);
    });

    it('should have proper heading structure', () => {
      const wrapper = mount(AddCounterModal);

      const title = wrapper.find('#add-title');
      expect(title.element.tagName).toBe('H2');
      expect(title.text()).toBe('Nuevo contador');
    });
  });

  describe('Transitions', () => {
    it('should have proper transition names', () => {
      const wrapper = mount(AddCounterModal);

      const outerTransition = wrapper.findComponent({ name: 'Transition' });
      expect(outerTransition.props('name')).toBe('modal');

      const innerTransition = wrapper.findAllComponents({ name: 'Transition' })[1];
      expect(innerTransition?.props('name')).toBe('modal-scale');
    });
  });
});

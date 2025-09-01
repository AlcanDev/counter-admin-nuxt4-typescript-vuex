import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Counter from '../../components/Counter.vue';

describe('Counter Component', () => {
  const defaultProps = {
    id: 'test-id',
    name: 'Test Counter',
    value: 5,
    canInc: true,
    canDec: true,
  };

  it('should render counter name and value', () => {
    const wrapper = mount(Counter, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('Test Counter');
    expect(wrapper.text()).toContain('5');
  });

  it('should emit inc event when +1 button is clicked', async () => {
    const wrapper = mount(Counter, {
      props: defaultProps,
    });

    const buttons = wrapper.findAll('button');
    const incButton = buttons.find((btn) => btn.text().includes('+'));
    await incButton!.trigger('click');

    expect(wrapper.emitted('inc')).toBeTruthy();
    expect(wrapper.emitted('inc')?.[0]).toEqual(['test-id']);
  });

  it('should emit dec event when -1 button is clicked', async () => {
    const wrapper = mount(Counter, {
      props: defaultProps,
    });

    const buttons = wrapper.findAll('button');
    const decButton = buttons.find((btn) => btn.text().includes('−'));
    await decButton!.trigger('click');

    expect(wrapper.emitted('dec')).toBeTruthy();
    expect(wrapper.emitted('dec')?.[0]).toEqual(['test-id']);
  });

  it('should emit remove event when Eliminar button is clicked', async () => {
    const wrapper = mount(Counter, {
      props: defaultProps,
    });

    const buttons = wrapper.findAll('button');
    const removeButton = buttons.find((btn) => btn.attributes('title') === 'Eliminar');
    await removeButton!.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')?.[0]).toEqual(['test-id']);
  });

  it('should disable +1 button when canInc is false', () => {
    const wrapper = mount(Counter, {
      props: {
        ...defaultProps,
        canInc: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const incButton = buttons.find((btn) => btn.text().includes('+'));
    expect(incButton!.attributes('disabled')).toBeDefined();
  });

  it('should disable -1 button when canDec is false', () => {
    const wrapper = mount(Counter, {
      props: {
        ...defaultProps,
        canDec: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const decButton = buttons.find((btn) => btn.text().includes('−'));
    expect(decButton!.attributes('disabled')).toBeDefined();
  });

  describe('Rename functionality', () => {
    it('should enter edit mode when Renombrar button is clicked', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      expect(wrapper.find('input').exists()).toBe(true);
      const updatedButtons = wrapper.findAll('button');
      const saveButton = updatedButtons.find((btn) => btn.text().includes('Guardar'));
      expect(saveButton!.exists()).toBe(true);
    });

    it('should exit edit mode and emit rename when Guardar is clicked with valid name', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      // Enter edit mode
      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      // Change the input value
      const input = wrapper.find('input');
      await input.setValue('New Counter Name');

      // Save
      const updatedButtons = wrapper.findAll('button');
      const saveButton = updatedButtons.find((btn) => btn.text().includes('Guardar'));
      await saveButton!.trigger('click');

      expect(wrapper.emitted('rename')).toBeTruthy();
      expect(wrapper.emitted('rename')?.[0]).toEqual([
        {
          id: 'test-id',
          name: 'New Counter Name',
        },
      ]);

      // Should exit edit mode
      expect(wrapper.find('input').exists()).toBe(false);
    });

    it('should trim whitespace when saving', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      await input.setValue('  Trimmed Name  ');

      const updatedButtons = wrapper.findAll('button');
      const saveButton = updatedButtons.find((btn) => btn.text().includes('Guardar'));
      await saveButton!.trigger('click');

      expect(wrapper.emitted('rename')?.[0]).toEqual([
        {
          id: 'test-id',
          name: 'Trimmed Name',
        },
      ]);
    });

    it('should not emit rename for empty names', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      await input.setValue('   ');

      const updatedButtons = wrapper.findAll('button');
      const saveButton = updatedButtons.find((btn) => btn.text().includes('Guardar'));
      await saveButton!.trigger('click');

      expect(wrapper.emitted('rename')).toBeFalsy();
    });

    it('should not emit rename for names longer than 20 characters', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      await input.setValue('This name is way too long for the counter limit');

      const updatedButtons = wrapper.findAll('button');
      const saveButton = updatedButtons.find((btn) => btn.text().includes('Guardar'));
      await saveButton!.trigger('click');

      expect(wrapper.emitted('rename')).toBeFalsy();
    });

    it('should cancel edit mode when Esc key is pressed', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      await input.setValue('Changed Name');
      await input.trigger('keydown.esc');

      // Should exit edit mode without emitting rename
      expect(wrapper.find('input').exists()).toBe(false);
      expect(wrapper.emitted('rename')).toBeFalsy();
    });

    it('should save when Enter key is pressed', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      await input.setValue('Enter Save');
      await input.trigger('keydown.enter');

      expect(wrapper.emitted('rename')).toBeTruthy();
      expect(wrapper.emitted('rename')?.[0]).toEqual([
        {
          id: 'test-id',
          name: 'Enter Save',
        },
      ]);
    });

    it('should respect maxlength attribute on input', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      expect(input.attributes('maxlength')).toBe('20');
    });

    it('should focus input when entering edit mode', async () => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      const wrapper = mount(Counter, {
        attachTo: host,
        props: defaultProps,
      });

      const renameButton = wrapper
        .findAll('button')
        .find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input');
      expect(input.exists()).toBe(true);
      expect(document.activeElement).toBe(input.element);

      wrapper.unmount();
      host.remove();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const removeButton = buttons.find((btn) => btn.attributes('title') === 'Eliminar');
      expect(removeButton!.attributes('title')).toBe('Eliminar');
    });

    it('should have proper input id in edit mode', async () => {
      const wrapper = mount(Counter, {
        props: defaultProps,
      });

      const buttons = wrapper.findAll('button');
      const renameButton = buttons.find((btn) => btn.attributes('title') === 'Renombrar');
      await renameButton!.trigger('click');

      const input = wrapper.find('input');
      expect(input.attributes('id')).toBe('edit-test-id');
    });
  });
});

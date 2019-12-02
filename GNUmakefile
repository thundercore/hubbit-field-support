TOP_DIR := $(patsubst %/,%,$(dir $(realpath $(lastword $(MAKEFILE_LIST)))))
NODE_MODULES_DIR := $(TOP_DIR)/node_modules
NODE_MODULES_BIN_DIR := $(NODE_MODULES_DIR)/.bin
export PATH := $(NODE_MODULES_BIN_DIR):$(PATH)
-include Local.mk

PREFERRED_INTERACTIVE_SHELL ?= bash
MAKE_SHELL_PS1 ?= hubbit-field-support' $$ '
.PHONY: shell
ifeq ($(PREFERRED_INTERACTIVE_SHELL),bash)
shell:
	@INIT_FILE=$(shell mktemp); \
	printf '[ -e $$HOME/.bashrc ] && source $$HOME/.bashrc\n' >> $$INIT_FILE; \
	printf 'export PATH="%s"\n' "$(PATH)" >> $$INIT_FILE; \
	printf 'PS1='"$(MAKE_SHELL_PS1) "'\n' >> $$INIT_FILE; \
	printf '[ -e Local.env ] && source Local.env\n' >> $$INIT_FILE; \
	$(PREFERRED_INTERACTIVE_SHELL) --init-file $$INIT_FILE || true
else ifeq ($(PREFERRED_INTERACTIVE_SHELL),fish)
shell:
	@INIT_FILE=$(shell mktemp); \
	printf 'if functions -q fish_right_prompt\n' > $$INIT_FILE; \
	printf '    functions -c fish_right_prompt __fish_right_prompt_original\n' >> $$INIT_FILE; \
	printf '    functions -e fish_right_prompt\n' >> $$INIT_FILE; \
	printf 'else\n' >> $$INIT_FILE; \
	printf '    function __fish_right_prompt_original\n' >> $$INIT_FILE; \
	printf '    end\n' >> $$INIT_FILE; \
	printf 'end\n' >> $$INIT_FILE; \
	printf 'function fish_right_prompt\n' >> $$INIT_FILE; \
	printf '    echo -n "(hodl) "\n' >> $$INIT_FILE; \
	printf '    __fish_right_prompt_original\n' >> $$INIT_FILE; \
	printf 'end\n' >> $$INIT_FILE; \
	$(PREFERRED_INTERACTIVE_SHELL) --init-command="source $$INIT_FILE" || true
else
shell:
	@$(PREFERRED_INTERACTIVE_SHELL) || true
endif

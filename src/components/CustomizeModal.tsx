'use client';

import { useState } from 'react';

interface CustomizeModalProps {
  onSave: (instructions: string) => void;
  onClose: () => void;
  currentInstructions: string;
}

const EXAMPLE_SUGGESTIONS = [
  'Me chame de [seu nome] e use linguagem informal',
  'Foque apenas em produtos para [categoria]',
  'Sempre me mande um resumo no final da resposta',
  'Use tom mais técnico nos detalhes dos produtos',
];

export default function CustomizeModal({
  onSave,
  onClose,
  currentInstructions,
}: CustomizeModalProps) {
  const [instructions, setInstructions] = useState(currentInstructions);
  const [showSuggestions, setShowSuggestions] = useState(!currentInstructions);

  function handleSave() {
    onSave(instructions);
    onClose();
  }

  function addSuggestion(suggestion: string) {
    setInstructions((prev) =>
      prev ? `${prev}\n- ${suggestion}` : `- ${suggestion}`
    );
    setShowSuggestions(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 animate-in">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              Personalizar Atendente
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Diga como você quer ser atendido e a IA vai se adaptar ao seu
              estilo. É como ensinar o atendente a falar do seu jeito.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Sugestões rápidas */}
        {showSuggestions && !currentInstructions && (
          <div className="mb-5 bg-[#faf6f0] rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">
              💡 Sugestões — clique para adicionar:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addSuggestion(suggestion)}
                  className="text-xs bg-white border border-[#ebe3d5] hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-full transition-colors text-gray-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campo de texto */}
        <div className="mb-2">
          <label htmlFor="custom-instructions" className="form-label mb-2">
            Como você quer que o atendente se comporte?
          </label>
          <textarea
            id="custom-instructions"
            className="textarea-field"
            rows={6}
            placeholder="Descreva como você prefere ser atendido...

Exemplos:
- Me chame de João, use linguagem informal
- Foque em produtos para casa e decoração
- Sempre confirme os preços antes de sugerir
- Se eu perguntar algo técnico, explique de forma simples"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            autoFocus
          />
        </div>

        {/* Info sobre limites */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
          <p className="text-xs text-amber-700">
            ⚠️ Suas preferências são sugestões. O atendente segue regras do
            negócio que não podem ser alteradas (como política de preços,
            formas de pagamento, etc.).
          </p>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-primary text-sm">
            {currentInstructions
              ? '💾 Atualizar Preferências'
              : '✨ Aplicar Personalização'}
          </button>
        </div>
      </div>
    </div>
  );
}
